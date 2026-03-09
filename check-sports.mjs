import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndqgvqajdjrzbwgsmmoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcWd2cWFqZGpyemJ3Z3NtbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkwMTQ5NiwiZXhwIjoyMDg4NDc3NDk2fQ._pZt-UfTsPMkWvYpNRvIvQGj5E78uAK-1eRfVkSbHv0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSports() {
    const { data, error } = await supabase.from('sports').select('*').order('name');
    if (error) {
        console.error("Error fetching sports:", error);
        return;
    }

    for (const sport of data) {
        console.log(`\n=========================================`);
        console.log(`Esporte: ${sport.name} (${sport.slug})`);
        if (sport.specific_fields && Array.isArray(sport.specific_fields)) {
            sport.specific_fields.forEach(f => {
                console.log(`  - [${f.key}] ${f.label} (${f.type})`);
            });
        } else {
            console.log(`  (Nenhum campo específico)`);
        }
    }
}

checkSports();
