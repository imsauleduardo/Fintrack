const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hevkodwlacmjpfxsgolt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldmtvZHdsYWNtanBmeHNnb2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NTIwNiwiZXhwIjoyMDg0NzIxMjA2fQ.Yyfm4Aj65E0v-DMCB2jqeUgnprHzyiSdCSlFuHO9SBs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching categories...");
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Total Categories:", data.length);
        const userIds = [...new Set(data.map(c => c.user_id))];
        console.log("Distinct User IDs:", userIds);
        console.log("Null User ID count:", data.filter(c => c.user_id === null).length);
    }
}

main();
