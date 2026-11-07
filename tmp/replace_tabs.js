const fs = require('fs');
const file = '/src/components/admin/ManageQuestionsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '{/* ================= TAB 1: SEGMENT QUESTIONS ================= */}';
const endMarker = '{/* ================= TAB 1: CAMPOS DO ONBOARDING ================= */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacement = `{/* ================= TAB 2: PERGUNTAS POR SEGMENTO ================= */}
        {activeTab === 'segments' && (
          <SegmentsAndQuestionsManager
            segments={editableSegments}
            onChange={(updated) => {
              setEditableSegments(updated);
            }}
          />
        )}

        `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully replaced old segments tab with SegmentsAndQuestionsManager!');
