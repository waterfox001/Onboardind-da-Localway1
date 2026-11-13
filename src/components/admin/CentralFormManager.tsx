import React, { useState } from 'react';
import {
  ConditionalRule,
  ManagedServiceConfig,
  UniversalQuestion,
  UniversalQuestionType,
} from '../../types';
import {
  FormSchemaState,
  FormCategoryConfig,
  OnboardingFieldConfig,
  DEFAULT_CATEGORIES_CONFIG,
  DEFAULT_ONBOARDING_FIELDS,
  evaluateCondition,
} from '../../constants/formSchema';
import { SegmentConfig, SegmentQuestion } from '../../constants/segments';
import { DEFAULT_SERVICES_CONFIG } from '../../constants/services';
import { INITIAL_ONBOARDING_DATA } from '../../constants/initialData';
import { StepGeneralPage } from '../steps/StepGeneralPage';
import { ModuleGoogleProfile } from '../steps/modules/ModuleGoogleProfile';
import { ModuleWebsite } from '../steps/modules/ModuleWebsite';
import { ModuleMiniSite } from '../steps/modules/ModuleMiniSite';
import { DynamicExtraQuestions } from '../steps/DynamicExtraQuestions';
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Search,
  Sliders,
  Layers,
  Briefcase,
  GitBranch,
  AlertCircle,
  Sparkles,
  Play,
  FolderPlus,
} from 'lucide-react';

interface CentralFormManagerProps {
  schema: FormSchemaState;
  onChangeSchema: (updated: FormSchemaState) => void;
  initialScope?: 'general' | 'google' | 'site' | 'minisite' | 'other_service' | 'segment';
  initialServiceId?: string;
}

type ManagerScope = 'general' | 'google' | 'site' | 'minisite' | 'other_service' | 'segment';

export const ALL_QUESTION_TYPES: {
  value: UniversalQuestionType;
  label: string;
  hasOptions?: boolean;
}[] = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Seleção única (Dropdown)', hasOptions: true },
  { value: 'radio', label: 'Múltipla escolha (Única opção)', hasOptions: true },
  { value: 'checkbox', label: 'Caixas de seleção (Múltiplas opções)', hasOptions: true },
  { value: 'yes_no', label: 'Sim / Não' },
  { value: 'date', label: 'Data' },
  { value: 'file', label: 'Upload de arquivo' },
  { value: 'url', label: 'Link / URL' },
  { value: 'repeatable', label: 'Lista repetível' },
  { value: 'products_catalog', label: 'Catálogo de produtos' },
  { value: 'services_catalog', label: 'Catálogo de serviços' },
];

const TYPE_LABEL_MAP: Record<string, string> = {
  text: 'Texto curto',
  textarea: 'Texto longo',
  number: 'Número',
  email: 'E-mail',
  tel: 'Telefone',
  url: 'Link / URL',
  select: 'Seleção única',
  radio: 'Múltipla escolha',
  checkbox: 'Caixas de seleção',
  yes_no: 'Sim / Não',
  date: 'Data',
  file: 'Arquivo',
  repeatable: 'Lista repetível',
  products_catalog: 'Catálogo de produtos',
  services_catalog: 'Catálogo de serviços',
  segment_select: 'Seletor de Segmento',
  schedule_grid: 'Grade de Horários (Seg-Dom)',
  no_physical_toggle: 'Sem Local Físico',
  shared_catalog: 'Cadastro Compartilhado',
};

const SPECIAL_TYPES = new Set([
  'segment_select',
  'schedule_grid',
  'no_physical_toggle',
  'shared_catalog',
  'email',
  'tel',
]);

export const CentralFormManager: React.FC<CentralFormManagerProps> = ({
  schema,
  onChangeSchema,
  initialScope = 'general',
  initialServiceId = 'google',
}) => {
  const resolveInitialScope = (): ManagerScope => {
    if (initialScope === 'google' || initialScope === 'site' || initialScope === 'minisite') {
      return initialScope;
    }
    if (initialScope === 'segment') return 'segment';
    if (initialScope === 'other_service') return 'other_service';
    return 'general';
  };

  const [scope, setScope] = useState<ManagerScope>(resolveInitialScope());
  const [pageFilter, setPageFilter] = useState<'all' | 'general_company' | 'general_structure'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const servicesMap = schema.servicesConfig || DEFAULT_SERVICES_CONFIG;
  const segmentsMap = schema.segmentsConfig || {};
  const categoriesList: FormCategoryConfig[] = (
    schema.categoriesConfig && schema.categoriesConfig.length > 0
      ? schema.categoriesConfig
      : DEFAULT_CATEGORIES_CONFIG
  )
    .slice()
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const fieldsList: OnboardingFieldConfig[] = (
    schema.onboardingFields && schema.onboardingFields.length > 0
      ? schema.onboardingFields
      : DEFAULT_ONBOARDING_FIELDS
  )
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const otherServiceIds = Object.keys(servicesMap).filter(
    (id) => !['google', 'site', 'minisite'].includes(id)
  );
  const [selectedOtherServiceId, setSelectedOtherServiceId] = useState<string>(
    !['google', 'site', 'minisite'].includes(initialServiceId)
      ? initialServiceId
      : otherServiceIds[0] || 'ecommerce'
  );

  const segmentKeys = Object.keys(segmentsMap);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>(segmentKeys[0] || 'Fotografia');

  // Sync external initialScope updates
  React.useEffect(() => {
    if (initialScope) setScope(initialScope);
    if (initialServiceId && !['google', 'site', 'minisite'].includes(initialServiceId)) {
      setSelectedOtherServiceId(initialServiceId);
    }
  }, [initialScope, initialServiceId]);

  // Drag-and-drop states
  const [dragFieldId, setDragFieldId] = useState<string | null>(null);
  const [dragCategoryId, setDragCategoryId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dragQuestionIdx, setDragQuestionIdx] = useState<number | null>(null);

  // Edit/Create Field/Question Modal State
  const [editorMode, setEditorMode] = useState<{
    isOpen: boolean;
    isNew: boolean;
    targetKind: 'general' | 'service' | 'segment';
    itemId?: string;
    categoryId?: string;
  } | null>(null);

  const [edLabel, setEdLabel] = useState('');
  const [edType, setEdType] = useState<string>('text');
  const [edHelper, setEdHelper] = useState('');
  const [edPlaceholder, setEdPlaceholder] = useState('');
  const [edRequired, setEdRequired] = useState(false);
  const [edEnabled, setEdEnabled] = useState(true);
  const [edCategoryId, setEdCategoryId] = useState('cat_company');
  const [edOptions, setEdOptions] = useState<string[]>(['Opção 1', 'Opção 2']);
  const [edAllowOther, setEdAllowOther] = useState(false);
  const [newOptText, setNewOptText] = useState('');

  // Conditional rule editor state
  const [hasCondition, setHasCondition] = useState(false);
  const [condDependsOn, setCondDependsOn] = useState('');
  const [condOperator, setCondOperator] = useState<ConditionalRule['operator']>('equals');
  const [condValue, setCondValue] = useState('');

  // Segment create/edit modal state
  const [segmentModal, setSegmentModal] = useState<{
    mode: 'create' | 'edit';
    origKey?: string;
    name: string;
    category: string;
    description: string;
  } | null>(null);

  // Safe Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    kind: 'general' | 'service' | 'segment_question' | 'segment';
    id: string;
    label: string;
  } | null>(null);

  // Live Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(() => ({ ...INITIAL_ONBOARDING_DATA }));
  const [previewPage, setPreviewPage] = useState<'general_company' | 'general_structure'>('general_company');

  const activeServiceId =
    scope === 'google'
      ? 'google'
      : scope === 'site'
      ? 'site'
      : scope === 'minisite'
      ? 'minisite'
      : scope === 'other_service'
      ? selectedOtherServiceId
      : null;

  // ===================== HELPERS TO COMMIT SCHEMA =====================
  const commitGeneralFields = (nextFields: OnboardingFieldConfig[], nextCategories?: FormCategoryConfig[]) => {
    const normalizedFields = nextFields.map((f, i) => ({ ...f, order: i + 1 }));
    onChangeSchema({
      ...schema,
      onboardingFields: normalizedFields,
      companyFields: normalizedFields.filter((f) => f.categoryId === 'cat_company'),
      categoriesConfig: nextCategories || categoriesList,
    });
  };

  const commitServiceQuestions = (serviceId: string, nextQuestions: UniversalQuestion[]) => {
    const svc = servicesMap[serviceId];
    if (!svc) return;
    const normalized = nextQuestions.map((q, i) => ({ ...q, order: i + 1 }));
    onChangeSchema({
      ...schema,
      servicesConfig: {
        ...servicesMap,
        [serviceId]: {
          ...svc,
          questions: normalized,
        },
      },
    });
  };

  const commitSegmentQuestions = (segKey: string, nextQuestions: SegmentQuestion[]) => {
    const seg = segmentsMap[segKey];
    if (!seg) return;
    onChangeSchema({
      ...schema,
      segmentsConfig: {
        ...segmentsMap,
        [segKey]: {
          ...seg,
          questions: nextQuestions.map((q, i) => ({ ...q, order: i + 1 })),
        },
      },
    });
  };

  // ===================== CATEGORY DRAG / REORDER =====================
  const handleMoveCategory = (catId: string, direction: 'up' | 'down') => {
    const cat = categoriesList.find((c) => c.id === catId);
    if (!cat) return;
    const samePage = categoriesList.filter((c) => c.pageId === cat.pageId);
    const idx = samePage.findIndex((c) => c.id === catId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= samePage.length) return;

    const reorderedPage = [...samePage];
    const [moved] = reorderedPage.splice(idx, 1);
    reorderedPage.splice(targetIdx, 0, moved);

    const otherPage = categoriesList.filter((c) => c.pageId !== cat.pageId);
    const combined =
      cat.pageId === 'general_company'
        ? [...reorderedPage, ...otherPage]
        : [...otherPage, ...reorderedPage];

    const updatedCats = combined.map((c, i) => ({ ...c, order: i + 1 }));
    commitGeneralFields(fieldsList, updatedCats);
  };

  const handleDropCategory = (targetCatId: string) => {
    if (!dragCategoryId || dragCategoryId === targetCatId) {
      setDragCategoryId(null);
      setDropTargetId(null);
      return;
    }
    const sourceIdx = categoriesList.findIndex((c) => c.id === dragCategoryId);
    const targetIdx = categoriesList.findIndex((c) => c.id === targetCatId);
    if (sourceIdx < 0 || targetIdx < 0) return;

    const nextCats = [...categoriesList];
    const [moved] = nextCats.splice(sourceIdx, 1);
    const targetCat = categoriesList[targetIdx];
    nextCats.splice(targetIdx, 0, { ...moved, pageId: targetCat.pageId });

    // Update pageId of all fields belonging to moved category if it changed pages
    const nextFields = fieldsList.map((f) =>
      f.categoryId === moved.id ? { ...f, pageId: targetCat.pageId } : f
    );

    const normalizedCats = nextCats.map((c, i) => ({ ...c, order: i + 1 }));
    commitGeneralFields(nextFields, normalizedCats);
    setDragCategoryId(null);
    setDropTargetId(null);
  };

  // ===================== GENERAL FIELD DRAG / MOVE =====================
  const handleDropFieldOnField = (targetFieldId: string) => {
    if (!dragFieldId || dragFieldId === targetFieldId) {
      setDragFieldId(null);
      setDropTargetId(null);
      return;
    }
    const sourceIdx = fieldsList.findIndex((f) => f.id === dragFieldId);
    const targetIdx = fieldsList.findIndex((f) => f.id === targetFieldId);
    if (sourceIdx < 0 || targetIdx < 0) return;

    const targetField = fieldsList[targetIdx];
    const nextFields = [...fieldsList];
    const [moved] = nextFields.splice(sourceIdx, 1);

    const updatedMoved: OnboardingFieldConfig = {
      ...moved,
      categoryId: targetField.categoryId,
      category: targetField.category,
      pageId: targetField.pageId,
    };

    const insertIdx = nextFields.findIndex((f) => f.id === targetFieldId);
    nextFields.splice(insertIdx >= 0 ? insertIdx : nextFields.length, 0, updatedMoved);
    commitGeneralFields(nextFields);
    setDragFieldId(null);
    setDropTargetId(null);
  };

  const handleDropFieldOnCategory = (targetCat: FormCategoryConfig) => {
    if (!dragFieldId) return;
    const sourceIdx = fieldsList.findIndex((f) => f.id === dragFieldId);
    if (sourceIdx < 0) return;

    const nextFields = [...fieldsList];
    const [moved] = nextFields.splice(sourceIdx, 1);
    const updatedMoved: OnboardingFieldConfig = {
      ...moved,
      categoryId: targetCat.id,
      category: targetCat.title,
      pageId: targetCat.pageId,
    };

    // Insert at end of that category
    let lastIdxInCat = -1;
    nextFields.forEach((f, i) => {
      if (f.categoryId === targetCat.id) lastIdxInCat = i;
    });
    if (lastIdxInCat >= 0) {
      nextFields.splice(lastIdxInCat + 1, 0, updatedMoved);
    } else {
      nextFields.push(updatedMoved);
    }

    commitGeneralFields(nextFields);
    setDragFieldId(null);
    setDropTargetId(null);
  };

  const handleMoveGeneralField = (fieldId: string, direction: 'up' | 'down') => {
    const field = fieldsList.find((f) => f.id === fieldId);
    if (!field) return;
    const catFields = fieldsList.filter((f) => f.categoryId === field.categoryId);
    const idxInCat = catFields.findIndex((f) => f.id === fieldId);
    const swapTarget = direction === 'up' ? catFields[idxInCat - 1] : catFields[idxInCat + 1];
    if (!swapTarget) return;

    const a = fieldsList.findIndex((f) => f.id === fieldId);
    const b = fieldsList.findIndex((f) => f.id === swapTarget.id);
    const next = [...fieldsList];
    const temp = next[a];
    next[a] = next[b];
    next[b] = temp;
    commitGeneralFields(next);
  };

  // ===================== SERVICE / SEGMENT QUESTION DRAG & MOVE =====================
  const handleReorderList = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    if (activeServiceId) {
      const qs = [...(servicesMap[activeServiceId]?.questions || [])];
      if (toIdx >= qs.length) return;
      const [moved] = qs.splice(fromIdx, 1);
      qs.splice(toIdx, 0, moved);
      commitServiceQuestions(activeServiceId, qs);
    } else if (scope === 'segment' && segmentsMap[selectedSegmentKey]) {
      const qs = [...(segmentsMap[selectedSegmentKey].questions || [])];
      if (toIdx >= qs.length) return;
      const [moved] = qs.splice(fromIdx, 1);
      qs.splice(toIdx, 0, moved);
      commitSegmentQuestions(selectedSegmentKey, qs);
    }
  };

  // ===================== OPEN CREATE / EDIT MODAL =====================
  const openCreateModal = (targetKind: 'general' | 'service' | 'segment', defaultCatId?: string) => {
    setEditorMode({
      isOpen: true,
      isNew: true,
      targetKind,
      categoryId: defaultCatId || 'cat_company',
    });
    setEdLabel('');
    setEdType('text');
    setEdHelper('');
    setEdPlaceholder('');
    setEdRequired(false);
    setEdEnabled(true);
    setEdCategoryId(defaultCatId || 'cat_company');
    setEdOptions(['Opção 1', 'Opção 2']);
    setEdAllowOther(false);
    setNewOptText('');
    setHasCondition(false);
    setCondDependsOn('');
    setCondOperator('equals');
    setCondValue('Sim');
  };

  const openEditGeneralField = (field: OnboardingFieldConfig) => {
    setEditorMode({
      isOpen: true,
      isNew: false,
      targetKind: 'general',
      itemId: field.id,
      categoryId: field.categoryId || 'cat_company',
    });
    setEdLabel(field.label);
    setEdType(field.type);
    setEdHelper(field.helper || '');
    setEdPlaceholder(field.placeholder || '');
    setEdRequired(Boolean(field.required));
    setEdEnabled(field.enabled !== false);
    setEdCategoryId(field.categoryId || 'cat_company');
    setEdOptions(field.options && field.options.length > 0 ? field.options : ['Opção 1', 'Opção 2']);
    setEdAllowOther(Boolean(field.allowOther));
    setNewOptText('');
    setHasCondition(Boolean(field.conditional?.dependsOn));
    setCondDependsOn(field.conditional?.dependsOn || '');
    setCondOperator(field.conditional?.operator || 'equals');
    setCondValue(field.conditional?.value || '');
  };

  const openEditServiceOrSegmentQuestion = (
    targetKind: 'service' | 'segment',
    q: UniversalQuestion | SegmentQuestion
  ) => {
    setEditorMode({
      isOpen: true,
      isNew: false,
      targetKind,
      itemId: q.id,
    });
    setEdLabel(q.label);
    setEdType((q.type as string) || 'text');
    setEdHelper(q.helper || '');
    setEdPlaceholder(q.placeholder || '');
    setEdRequired(Boolean(q.required));
    setEdEnabled(q.enabled !== false);
    setEdOptions(q.options && q.options.length > 0 ? q.options : ['Opção 1', 'Opção 2']);
    setEdAllowOther(Boolean((q as any).allowOther || (q as any).otherLabel));
    setNewOptText('');
    setHasCondition(Boolean(q.conditional?.dependsOn));
    setCondDependsOn(q.conditional?.dependsOn || '');
    setCondOperator(q.conditional?.operator || 'equals');
    setCondValue(q.conditional?.value || '');
  };

  const handleSaveEditorModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorMode || !edLabel.trim()) return;

    const cleanOptions = edOptions.map((o) => o.trim()).filter(Boolean);
    const needsOptions = ['select', 'radio', 'checkbox'].includes(edType);
    const conditionalRule: ConditionalRule | undefined =
      hasCondition && condDependsOn.trim()
        ? {
            dependsOn: condDependsOn.trim(),
            operator: condOperator,
            value: condOperator === 'not_empty' ? undefined : condValue,
          }
        : undefined;

    if (editorMode.targetKind === 'general') {
      const targetCat = categoriesList.find((c) => c.id === edCategoryId) || categoriesList[0];
      if (editorMode.isNew) {
        const newId = `custom_${Date.now()}`;
        const newField: OnboardingFieldConfig = {
          id: newId,
          key: newId,
          label: edLabel.trim(),
          type: edType as any,
          helper: edHelper.trim() || undefined,
          placeholder: edPlaceholder.trim() || undefined,
          required: edRequired,
          enabled: edEnabled,
          order: fieldsList.length + 1,
          stepId: targetCat.pageId,
          pageId: targetCat.pageId,
          categoryId: targetCat.id,
          category: targetCat.title,
          options: needsOptions ? cleanOptions : undefined,
          allowOther: needsOptions ? edAllowOther : undefined,
          conditional: conditionalRule,
        };
        commitGeneralFields([...fieldsList, newField]);
      } else {
        const nextFields = fieldsList.map((f) => {
          if (f.id !== editorMode.itemId) return f;
          return {
            ...f,
            label: edLabel.trim(),
            type: edType as any,
            helper: edHelper.trim() || undefined,
            placeholder: edPlaceholder.trim() || undefined,
            required: edRequired,
            enabled: edEnabled,
            pageId: targetCat.pageId,
            categoryId: targetCat.id,
            category: targetCat.title,
            options: needsOptions ? cleanOptions : f.options,
            allowOther: needsOptions ? edAllowOther : f.allowOther,
            conditional: conditionalRule,
          };
        });
        commitGeneralFields(nextFields);
      }
    } else if (editorMode.targetKind === 'service' && activeServiceId) {
      const existingQs = servicesMap[activeServiceId]?.questions || [];
      if (editorMode.isNew) {
        const newId = `q_svc_${Date.now()}`;
        const newQ: UniversalQuestion = {
          id: newId,
          key: newId,
          label: edLabel.trim(),
          type: edType as UniversalQuestionType,
          helper: edHelper.trim() || undefined,
          placeholder: edPlaceholder.trim() || undefined,
          required: edRequired,
          enabled: edEnabled,
          order: existingQs.length + 1,
          options: needsOptions ? cleanOptions : undefined,
          allowOther: needsOptions ? edAllowOther : undefined,
          conditional: conditionalRule,
        };
        commitServiceQuestions(activeServiceId, [...existingQs, newQ]);
      } else {
        const nextQs = existingQs.map((q) => {
          if (q.id !== editorMode.itemId) return q;
          return {
            ...q,
            label: edLabel.trim(),
            type: edType as UniversalQuestionType,
            helper: edHelper.trim() || undefined,
            placeholder: edPlaceholder.trim() || undefined,
            required: edRequired,
            enabled: edEnabled,
            options: needsOptions ? cleanOptions : q.options,
            allowOther: needsOptions ? edAllowOther : q.allowOther,
            conditional: conditionalRule,
          };
        });
        commitServiceQuestions(activeServiceId, nextQs);
      }
    } else if (editorMode.targetKind === 'segment' && segmentsMap[selectedSegmentKey]) {
      const existingQs = segmentsMap[selectedSegmentKey].questions || [];
      if (editorMode.isNew) {
        const newId = `seg_q_${Date.now()}`;
        const newQ: SegmentQuestion = {
          id: newId,
          label: edLabel.trim(),
          type: edType as any,
          helper: edHelper.trim() || undefined,
          placeholder: edPlaceholder.trim() || undefined,
          required: edRequired,
          enabled: edEnabled,
          order: existingQs.length + 1,
          options: needsOptions ? cleanOptions : undefined,
          otherLabel: needsOptions && edAllowOther ? 'Outro' : undefined,
          otherPlaceholder: needsOptions && edAllowOther ? 'Especifique...' : undefined,
          conditional: conditionalRule,
        };
        commitSegmentQuestions(selectedSegmentKey, [...existingQs, newQ]);
      } else {
        const nextQs = existingQs.map((q) => {
          if (q.id !== editorMode.itemId) return q;
          return {
            ...q,
            label: edLabel.trim(),
            type: edType as any,
            helper: edHelper.trim() || undefined,
            placeholder: edPlaceholder.trim() || undefined,
            required: edRequired,
            enabled: edEnabled,
            options: needsOptions ? cleanOptions : q.options,
            otherLabel: needsOptions && edAllowOther ? q.otherLabel || 'Outro' : undefined,
            conditional: conditionalRule,
          };
        });
        commitSegmentQuestions(selectedSegmentKey, nextQs);
      }
    }

    setEditorMode(null);
  };

  // ===================== SAFE DELETE =====================
  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.kind === 'general') {
      commitGeneralFields(fieldsList.filter((f) => f.id !== deleteConfirm.id));
    } else if (deleteConfirm.kind === 'service' && activeServiceId) {
      const qs = (servicesMap[activeServiceId]?.questions || []).filter((q) => q.id !== deleteConfirm.id);
      commitServiceQuestions(activeServiceId, qs);
    } else if (deleteConfirm.kind === 'segment_question' && segmentsMap[selectedSegmentKey]) {
      const qs = (segmentsMap[selectedSegmentKey].questions || []).filter((q) => q.id !== deleteConfirm.id);
      commitSegmentQuestions(selectedSegmentKey, qs);
    } else if (deleteConfirm.kind === 'segment') {
      const nextSegs = { ...segmentsMap };
      delete nextSegs[deleteConfirm.id];
      const nextKeys = Object.keys(nextSegs);
      onChangeSchema({ ...schema, segmentsConfig: nextSegs });
      setSelectedSegmentKey(nextKeys[0] || '');
    }
    setDeleteConfirm(null);
  };

  // ===================== SEGMENT CREATE / EDIT =====================
  const handleSaveSegmentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentModal || !segmentModal.name.trim()) return;
    const trimmed = segmentModal.name.trim();

    if (segmentModal.mode === 'create') {
      if (segmentsMap[trimmed]) {
        alert('Já existe um segmento com este nome.');
        return;
      }
      const nextSegs: Record<string, SegmentConfig> = {
        ...segmentsMap,
        [trimmed]: {
          name: trimmed,
          category: segmentModal.category.trim() || 'Serviços & Atendimento',
          description: segmentModal.description.trim() || 'Perguntas específicas do segmento',
          enabled: true,
          questions: [],
        },
      };
      onChangeSchema({ ...schema, segmentsConfig: nextSegs });
      setSelectedSegmentKey(trimmed);
    } else if (segmentModal.origKey && segmentsMap[segmentModal.origKey]) {
      const oldSeg = segmentsMap[segmentModal.origKey];
      const nextSegs = { ...segmentsMap };
      if (trimmed !== segmentModal.origKey) {
        delete nextSegs[segmentModal.origKey];
      }
      nextSegs[trimmed] = {
        ...oldSeg,
        name: trimmed,
        category: segmentModal.category.trim() || oldSeg.category,
        description: segmentModal.description.trim() || oldSeg.description,
      };
      onChangeSchema({ ...schema, segmentsConfig: nextSegs });
      setSelectedSegmentKey(trimmed);
    }
    setSegmentModal(null);
  };

  // Available dependency keys for Conditional Rule Picker
  const dependencyCandidates =
    scope === 'general'
      ? fieldsList.map((f) => ({ key: f.key || f.id, label: f.label }))
      : activeServiceId
      ? [
          ...(servicesMap[activeServiceId]?.questions || []).map((q) => ({
            key: q.storageKey || q.key || q.id,
            label: q.label,
          })),
          ...fieldsList.slice(0, 12).map((f) => ({ key: f.key || f.id, label: `[Geral] ${f.label}` })),
        ]
      : (segmentsMap[selectedSegmentKey]?.questions || []).map((q) => ({
          key: q.id,
          label: q.label,
        }));

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleCategories = categoriesList.filter((cat) => {
    if (pageFilter !== 'all' && cat.pageId !== pageFilter) return false;
    return true;
  });

  const activeServiceQuestions = activeServiceId
    ? (servicesMap[activeServiceId]?.questions || [])
        .slice()
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    : [];

  const activeSegment = segmentsMap[selectedSegmentKey];
  const activeSegmentQuestions = activeSegment?.questions || [];

  return (
    <div className="space-y-6" id="central-form-manager">
      {/* ================= TOP UNIFIED CONTROL BAR ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Gerenciador Central de Campos e Perguntas
              </h2>
              <p className="text-xs text-slate-500">
                Arraste e solte para reordenar ou mover categorias e perguntas. Edite textos, tipos, obrigatoriedade, visibilidade e regras condicionais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (scope === 'general') {
                setPreviewPage(pageFilter === 'general_structure' ? 'general_structure' : 'general_company');
              }
              setIsPreviewOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Prévia do Formulário</span>
          </button>
        </div>

        {/* Context Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'general', label: 'Onboarding Geral (Págs. 1 e 2)' },
            { id: 'google', label: 'Perfil no Google' },
            { id: 'site', label: 'Site Institucional' },
            { id: 'minisite', label: 'Mini Site' },
            { id: 'segment', label: 'Segmentos' },
            { id: 'other_service', label: 'Outros Serviços' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id as ManagerScope)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                scope === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Secondary Bar: Search / Page Filter / Service or Segment Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {scope === 'general' && (
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Todas as Páginas' },
                { id: 'general_company', label: 'Página 1: Empresa, Endereço e Horários' },
                { id: 'general_structure', label: 'Página 2: Estrutura, Catálogo e Materiais' },
              ].map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => setPageFilter(pf.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    pageFilter === pf.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
          )}

          {scope === 'other_service' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Serviço:</span>
              <select
                value={selectedOtherServiceId}
                onChange={(e) => setSelectedOtherServiceId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
              >
                {otherServiceIds.map((id) => (
                  <option key={id} value={id}>
                    {servicesMap[id]?.title || id}{' '}
                    {servicesMap[id]?.enabled === false ? '(Desativado)' : '(Ativo)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'segment' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Segmento:</span>
              <select
                value={selectedSegmentKey}
                onChange={(e) => setSelectedSegmentKey(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
              >
                {segmentKeys.map((k) => (
                  <option key={k} value={k}>
                    {segmentsMap[k]?.name || k} ({segmentsMap[k]?.questions?.length || 0} perg.)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  setSegmentModal({
                    mode: 'create',
                    name: '',
                    category: 'Serviços & Atendimento',
                    description: '',
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Novo Segmento</span>
              </button>

              {activeSegment && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSegmentModal({
                        mode: 'edit',
                        origKey: selectedSegmentKey,
                        name: activeSegment.name,
                        category: activeSegment.category || '',
                        description: activeSegment.description || '',
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Segmento</span>
                  </button>

                  {segmentKeys.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({
                          kind: 'segment',
                          id: selectedSegmentKey,
                          label: activeSegment.name,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar perguntas ou campos..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* ================= VIEW A: ONBOARDING GERAL (CATEGORIES + FIELDS DND) ================= */}
      {scope === 'general' && (
        <div className="space-y-5">
          {visibleCategories.map((cat) => {
            const catFields = fieldsList.filter((f) => {
              const matchesCat = f.categoryId === cat.id;
              if (!matchesCat) return false;
              if (!normalizedSearch) return true;
              return (
                f.label.toLowerCase().includes(normalizedSearch) ||
                (f.key || '').toLowerCase().includes(normalizedSearch)
              );
            });

            const isCatDropTarget = dropTargetId === `cat:${cat.id}`;

            return (
              <div
                key={cat.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetId(`cat:${cat.id}`);
                }}
                onDragLeave={() => {
                  if (dropTargetId === `cat:${cat.id}`) setDropTargetId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragCategoryId) {
                    handleDropCategory(cat.id);
                  } else if (dragFieldId) {
                    handleDropFieldOnCategory(cat);
                  }
                }}
                className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                  isCatDropTarget
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Category Header (Draggable to reorder categories) */}
                <div
                  draggable
                  onDragStart={() => {
                    setDragCategoryId(cat.id);
                    setDragFieldId(null);
                  }}
                  onDragEnd={() => {
                    setDragCategoryId(null);
                    setDropTargetId(null);
                  }}
                  className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2.5">
                    <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            cat.pageId === 'general_company'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {cat.pageId === 'general_company' ? 'Página 1' : 'Página 2'}
                        </span>
                      </div>
                      {cat.subtitle && <p className="text-[11px] text-slate-500">{cat.subtitle}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(cat.id, 'up')}
                      title="Subir categoria"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(cat.id, 'down')}
                      title="Descer categoria"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateModal('general', cat.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer ml-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo Campo</span>
                    </button>
                  </div>
                </div>

                {/* Fields List Inside Category */}
                <div className="divide-y divide-slate-100">
                  {catFields.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Nenhum campo correspondente nesta categoria. Arraste um campo para cá ou clique em &ldquo;Novo Campo&rdquo;.
                    </div>
                  ) : (
                    catFields.map((field, idx) => {
                      const isEnabled = field.enabled !== false;
                      const isFieldDrop = dropTargetId === `field:${field.id}`;

                      return (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDragFieldId(field.id);
                            setDragCategoryId(null);
                          }}
                          onDragEnd={() => {
                            setDragFieldId(null);
                            setDropTargetId(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (dragFieldId && dragFieldId !== field.id) {
                              setDropTargetId(`field:${field.id}`);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (dragFieldId) {
                              handleDropFieldOnField(field.id);
                            }
                          }}
                          className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isFieldDrop ? 'bg-blue-50/70 border-t-2 border-t-blue-500' : 'hover:bg-slate-50/60'
                          } ${!isEnabled ? 'opacity-60 bg-slate-50/40' : ''}`}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <span
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing shrink-0"
                              title="Arraste para reordenar ou mover de categoria"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">
                                  {field.label}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                                  {TYPE_LABEL_MAP[field.type] || field.type}
                                </span>
                                {field.required && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200/70">
                                    Obrigatório
                                  </span>
                                )}
                                {!isEnabled && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    Oculto
                                  </span>
                                )}
                                {field.conditional?.dependsOn && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                    title={`Condicional: ${field.conditional.dependsOn} ${field.conditional.operator} ${field.conditional.value || ''}`}
                                  >
                                    <GitBranch className="w-3 h-3" />
                                    Condicional
                                  </span>
                                )}
                              </div>

                              {(field.helper || (field.options && field.options.length > 0)) && (
                                <p className="text-[11px] text-slate-500 truncate">
                                  {field.helper ? `${field.helper} ` : ''}
                                  {field.options?.length
                                    ? `• Opções: ${field.options.slice(0, 4).join(', ')}${field.options.length > 4 ? '...' : ''}`
                                    : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Row Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveGeneralField(field.id, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                              title="Subir"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveGeneralField(field.id, 'down')}
                              disabled={idx === catFields.length - 1}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                              title="Descer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                commitGeneralFields(
                                  fieldsList.map((f) =>
                                    f.id === field.id ? { ...f, required: !f.required } : f
                                  )
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                                field.required
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                              title="Alternar obrigatoriedade"
                            >
                              {field.required ? 'Obrigatório' : 'Opcional'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                commitGeneralFields(
                                  fieldsList.map((f) =>
                                    f.id === field.id ? { ...f, enabled: f.enabled === false } : f
                                  )
                                )
                              }
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isEnabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                              title={isEnabled ? 'Ocultar campo' : 'Ativar campo'}
                            >
                              {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditGeneralField(field)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 cursor-pointer"
                              title="Editar campo e regra condicional"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  kind: 'general',
                                  id: field.id,
                                  label: field.label,
                                })
                              }
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Excluir campo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW B: SERVICES OR SEGMENTS QUESTIONS ================= */}
      {(activeServiceId || scope === 'segment') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {activeServiceId
                  ? `Perguntas — ${servicesMap[activeServiceId]?.title || activeServiceId}`
                  : `Perguntas do Segmento — ${activeSegment?.name || selectedSegmentKey}`}
              </h3>
              <p className="text-xs text-slate-500">
                Arraste qualquer pergunta para reordenar. Alterações refletem imediatamente no formulário e na prévia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openCreateModal(activeServiceId ? 'service' : 'segment')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(() => {
              const list = activeServiceId ? activeServiceQuestions : activeSegmentQuestions;
              const filtered = normalizedSearch
                ? list.filter((q) => q.label.toLowerCase().includes(normalizedSearch))
                : list;

              if (filtered.length === 0) {
                return (
                  <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                    <p>Nenhuma pergunta cadastrada ainda nesta seção.</p>
                    <button
                      type="button"
                      onClick={() => openCreateModal(activeServiceId ? 'service' : 'segment')}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar primeira pergunta
                    </button>
                  </div>
                );
              }

              return filtered.map((q: any, idx: number) => {
                const realIdx = list.findIndex((item) => item.id === q.id);
                const isEnabled = q.enabled !== false;
                const isDrop = dropTargetId === `q:${q.id}`;

                return (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => setDragQuestionIdx(realIdx)}
                    onDragEnd={() => {
                      setDragQuestionIdx(null);
                      setDropTargetId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetId(`q:${q.id}`);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragQuestionIdx !== null && dragQuestionIdx !== realIdx) {
                        handleReorderList(dragQuestionIdx, realIdx);
                      }
                      setDragQuestionIdx(null);
                      setDropTargetId(null);
                    }}
                    className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isDrop ? 'bg-blue-50/70 border-t-2 border-t-blue-500' : 'hover:bg-slate-50/60'
                    } ${!isEnabled ? 'opacity-60 bg-slate-50/40' : ''}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <span className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{q.label}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {TYPE_LABEL_MAP[q.type] || q.type}
                          </span>
                          {q.required && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200/70">
                              Obrigatória
                            </span>
                          )}
                          {!isEnabled && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Oculta
                            </span>
                          )}
                          {q.conditional?.dependsOn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <GitBranch className="w-3 h-3" />
                              Condicional
                            </span>
                          )}
                        </div>
                        {(q.helper || (q.options && q.options.length > 0)) && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {q.helper ? `${q.helper} ` : ''}
                            {q.options?.length
                              ? `• Opções: ${q.options.slice(0, 4).join(', ')}${q.options.length > 4 ? '...' : ''}`
                              : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReorderList(realIdx, realIdx - 1)}
                        disabled={realIdx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Subir"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderList(realIdx, realIdx + 1)}
                        disabled={realIdx === list.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Descer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeServiceId) {
                            commitServiceQuestions(
                              activeServiceId,
                              list.map((item: any) =>
                                item.id === q.id ? { ...item, required: !item.required } : item
                              )
                            );
                          } else {
                            commitSegmentQuestions(
                              selectedSegmentKey,
                              list.map((item: any) =>
                                item.id === q.id ? { ...item, required: !item.required } : item
                              )
                            );
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                          q.required
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {q.required ? 'Obrigatória' : 'Opcional'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeServiceId) {
                            commitServiceQuestions(
                              activeServiceId,
                              list.map((item: any) =>
                                item.id === q.id ? { ...item, enabled: item.enabled === false } : item
                              )
                            );
                          } else {
                            commitSegmentQuestions(
                              selectedSegmentKey,
                              list.map((item: any) =>
                                item.id === q.id ? { ...item, enabled: item.enabled === false } : item
                              )
                            );
                          }
                        }}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                        title={isEnabled ? 'Ocultar pergunta' : 'Ativar pergunta'}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditServiceOrSegmentQuestion(
                            activeServiceId ? 'service' : 'segment',
                            q
                          )
                        }
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 cursor-pointer"
                        title="Editar pergunta e opções"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            kind: activeServiceId ? 'service' : 'segment_question',
                            id: q.id,
                            label: q.label,
                          })
                        }
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Excluir pergunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT FIELD OR QUESTION ================= */}
      {editorMode?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editorMode.isNew ? 'Adicionar Nova Pergunta / Campo' : 'Editar Pergunta / Campo'}
              </h3>
              <button
                type="button"
                onClick={() => setEditorMode(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditorModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título / Enunciado *
                </label>
                <input
                  type="text"
                  value={edLabel}
                  onChange={(e) => setEdLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 outline-none"
                  placeholder="Ex: Qual o diferencial principal do atendimento?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Campo / Resposta
                  </label>
                  {SPECIAL_TYPES.has(edType) && !editorMode.isNew ? (
                    <input
                      type="text"
                      readOnly
                      value={TYPE_LABEL_MAP[edType] || edType}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600"
                    />
                  ) : (
                    <select
                      value={edType}
                      onChange={(e) => setEdType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    >
                      {ALL_QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {editorMode.targetKind === 'general' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categoria / Página no Onboarding Geral
                    </label>
                    <select
                      value={edCategoryId}
                      onChange={(e) => setEdCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.pageId === 'general_company' ? '[Pág. 1] ' : '[Pág. 2] '}
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Placeholder (Texto de exemplo)
                  </label>
                  <input
                    type="text"
                    value={edPlaceholder}
                    onChange={(e) => setEdPlaceholder(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Texto de Ajuda / Dica
                  </label>
                  <input
                    type="text"
                    value={edHelper}
                    onChange={(e) => setEdHelper(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edRequired}
                    onChange={(e) => setEdRequired(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Resposta Obrigatória</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edEnabled}
                    onChange={(e) => setEdEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Visível no Formulário</span>
                </label>
              </div>

              {/* Options Editor */}
              {['select', 'radio', 'checkbox'].includes(edType) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Opções de Resposta</span>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edAllowOther}
                        onChange={(e) => setEdAllowOther(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span>Permitir campo &ldquo;Outro&rdquo;</span>
                    </label>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {edOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...edOptions];
                            copy[idx] = e.target.value;
                            setEdOptions(copy);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setEdOptions(edOptions.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newOptText}
                      onChange={(e) => setNewOptText(e.target.value)}
                      placeholder="Nova opção..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newOptText.trim()) return;
                        setEdOptions([...edOptions, newOptText.trim()]);
                        setNewOptText('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Conditional Rule Builder */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCondition}
                    onChange={(e) => setHasCondition(e.target.checked)}
                    className="rounded border-purple-300 text-purple-600"
                  />
                  <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                  <span>Ativar regra condicional de exibição</span>
                </label>

                {hasCondition && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="block text-[10px] font-semibold text-purple-800 mb-1">
                        Depende de
                      </span>
                      <select
                        value={condDependsOn}
                        onChange={(e) => setCondDependsOn(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 outline-none"
                      >
                        <option value="">Selecione...</option>
                        {dependencyCandidates.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label.slice(0, 40)} ({c.key})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold text-purple-800 mb-1">
                        Condição
                      </span>
                      <select
                        value={condOperator}
                        onChange={(e) => setCondOperator(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 outline-none"
                      >
                        <option value="equals">É igual a</option>
                        <option value="not_equals">É diferente de</option>
                        <option value="includes">Contém</option>
                        <option value="not_empty">Não está vazio</option>
                      </select>
                    </div>

                    {condOperator !== 'not_empty' && (
                      <div>
                        <span className="block text-[10px] font-semibold text-purple-800 mb-1">
                          Valor esperado
                        </span>
                        <input
                          type="text"
                          value={condValue}
                          onChange={(e) => setCondValue(e.target.value)}
                          placeholder="Ex: Sim"
                          className="w-full px-2.5 py-2 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditorMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editorMode.isNew ? 'Criar Pergunta' : 'Aplicar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT SEGMENT ================= */}
      {segmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {segmentModal.mode === 'create' ? 'Novo Segmento' : 'Editar Segmento'}
              </h3>
              <button
                type="button"
                onClick={() => setSegmentModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSegmentModal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Segmento *</label>
                <input
                  type="text"
                  value={segmentModal.name}
                  onChange={(e) => setSegmentModal({ ...segmentModal, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grupo / Categoria</label>
                <input
                  type="text"
                  value={segmentModal.category}
                  onChange={(e) => setSegmentModal({ ...segmentModal, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={segmentModal.description}
                  onChange={(e) => setSegmentModal({ ...segmentModal, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSegmentModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Salvar Segmento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SAFE DELETE CONFIRMATION ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Confirmar exclusão</h4>
              <p className="text-xs text-slate-500">
                Deseja remover &ldquo;<strong>{deleteConfirm.label}</strong>&rdquo; do formulário ativo? As respostas já enviadas por clientes anteriores continuarão preservadas no histórico.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Excluir do Formulário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIVE INTERACTIVE PREVIEW ================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Prévia Interativa do Formulário
                </h3>
                <p className="text-xs text-slate-500">
                  Teste suas perguntas, ordem e regras condicionais ao vivo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {scope === 'general' && (
                  <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewPage('general_company')}
                      className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                        previewPage === 'general_company' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Página 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPage('general_structure')}
                      className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                        previewPage === 'general_structure' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Página 2
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {scope === 'general' && (
                <StepGeneralPage
                  pageId={previewPage}
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                  errors={{}}
                  schema={schema}
                />
              )}
              {scope === 'google' && (
                <ModuleGoogleProfile
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                  errors={{}}
                  serviceConfig={servicesMap.google}
                />
              )}
              {scope === 'site' && (
                <ModuleWebsite
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                  errors={{}}
                  serviceConfig={servicesMap.site}
                />
              )}
              {scope === 'minisite' && (
                <ModuleMiniSite
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                  errors={{}}
                  serviceConfig={servicesMap.minisite}
                />
              )}
              {scope === 'other_service' && activeServiceId && (
                <DynamicExtraQuestions
                  questions={servicesMap[activeServiceId]?.questions || []}
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                />
              )}
              {scope === 'segment' && (
                <DynamicExtraQuestions
                  questions={(activeSegmentQuestions || []) as any}
                  data={previewData}
                  onChange={(f, v) => setPreviewData((prev) => ({ ...prev, [f]: v }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
