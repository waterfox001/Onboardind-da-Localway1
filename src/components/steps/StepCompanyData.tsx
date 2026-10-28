import React, { useState, useRef, useEffect } from 'react';
import { OnboardingData } from '../../types';
import { TextInput, TextArea } from '../FormControls';
import { SEGMENT_OPTIONS } from '../../constants/segments';
import { CompanyFieldConfig } from '../../constants/formSchema';
import { Building2, ChevronDown, Check, X, Layers } from 'lucide-react';

interface StepCompanyDataProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  fields?: CompanyFieldConfig[];
  availableSegments?: string[];
}

export const StepCompanyData: React.FC<StepCompanyDataProps> = ({
  data,
  onChange,
  errors,
  fields,
  availableSegments,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // List of segment options from dynamic admin schema or fallback
  const segmentsList =
    availableSegments && availableSegments.length > 0
      ? availableSegments
      : SEGMENT_OPTIONS;

  // If dynamic fields are provided, sort them by order and filter by enabled
  const activeFields = (fields || [])
    .filter((f) => f.enabled !== false)
    .sort((a, b) => a.order - b.order);

  // Helper to render segment selector as a clean read-only text box with dropdown
  const renderSegmentSelector = (field: CompanyFieldConfig) => (
    <div key={field.id} className="space-y-1.5 pt-1 relative" ref={dropdownRef} id="field-segmento-container">
      <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
        <span>
          {field.label}
          {field.required && (
            <span className="text-slate-600 ml-1 font-bold" title="Campo obrigatório">
              *
            </span>
          )}
        </span>
      </label>

      {/* 
        Input box: read-only text-box that opens configured options on click.
        The user does NOT write arbitrary text; they choose from configured segments.
      */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className={`w-full px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer bg-white shadow-xs select-none ${
            isDropdownOpen
              ? 'border-slate-800 ring-2 ring-slate-400/20 text-slate-900'
              : data.segmento
              ? 'border-slate-300 text-slate-900 hover:border-slate-400'
              : 'border-slate-300 text-slate-400 hover:border-slate-400'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              {data.segmento || field.placeholder || 'Selecione o segmento da sua empresa...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {data.segmento && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('segmento', '');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onChange('segmento', '');
                  }
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Limpar seleção"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown options populated from admin settings */}
        {isDropdownOpen && (
          <div className="absolute z-40 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 animate-fadeIn">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Opções configuradas
            </div>
            {segmentsList.map((seg) => {
              const isSelected = data.segmento === seg;
              return (
                <button
                  type="button"
                  key={seg}
                  onClick={() => {
                    onChange('segmento', seg);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{seg}</span>
                  {isSelected && <Check className="w-4 h-4 text-slate-800" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {errors.segmento && (
        <span className="text-xs font-medium text-red-600 animate-fadeIn block pt-0.5">
          {errors.segmento}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6" id="step-company-data">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Dados da sua Empresa
          </h2>
        </div>
      </div>

      {/* Dynamic Ordered Fields */}
      <div className="space-y-4">
        {activeFields.length > 0 ? (
          activeFields.map((field) => {
            if (field.type === 'segment_select') {
              return renderSegmentSelector(field);
            }

            const value = (data as any)[field.key] ?? '';
            const error = errors[field.key];

            if (field.type === 'textarea') {
              return (
                <TextArea
                  key={field.id}
                  id={`company-${field.key}`}
                  label={field.label}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => onChange(field.key as keyof OnboardingData, e.target.value as any)}
                  error={error}
                  rows={4}
                />
              );
            }

            return (
              <TextInput
                key={field.id}
                id={`company-${field.key}`}
                type={field.type === 'email' ? 'email' : 'text'}
                label={field.label}
                required={field.required}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => onChange(field.key as keyof OnboardingData, e.target.value as any)}
                error={error}
              />
            );
          })
        ) : (
          /* Default clean layout fallback if no fields loaded */
          <div className="space-y-4">
            <TextInput
              id="company-nome-fantasia"
              label="Nome Fantasia"
              required
              placeholder="Ex: Pizzaria Bella Italia"
              value={data.nomeFantasia}
              onChange={(e) => onChange('nomeFantasia', e.target.value)}
              error={errors.nomeFantasia}
            />
            <TextInput
              id="company-razao-social"
              label="Razão Social"
              placeholder="Ex: Bella Italia Alimentos LTDA"
              value={data.razaoSocial}
              onChange={(e) => onChange('razaoSocial', e.target.value)}
            />
            <TextInput
              id="company-cnpj"
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={data.cnpj}
              onChange={(e) => onChange('cnpj', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
