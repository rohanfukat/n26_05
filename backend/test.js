const DEPARTMENTS = [
    "BMC - Water Supply Department",
    "BMC - Roads & Infrastructure (PWD)",
    "BMC - Solid Waste Management",
    "BMC - Storm Water Drains",
    "BMC - Public Health Department",
    "Mumbai Police",
    "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "Mumbai Fire Brigade",
    "Mumbai Metropolitan Region Development Authority (MMRDA)",
    "Slum Rehabilitation Authority (SRA)",
    "Maharashtra Pollution Control Board (MPCB)",
    "General Administration (BMC)"
];

// 🔥 Expanded keywords (VERY IMPORTANT)
const grievanceKeywords = [
    "complaint", "issue", "problem", "not working", "broken",
    "leak", "no water", "water problem",
    "garbage", "trash", "waste",
    "electricity", "power cut", "no power",
    "sewage", "drain", "drainage",
    "pollution", "smell",
    "road", "pothole",
    "traffic", "police",
    "fire", "hazard"
];

// ✅ Better filter (not too strict)
function isGrievance(title) {
    const text = title.toLowerCase();
    return grievanceKeywords.some(keyword => text.includes(keyword));
}

async function fetchGrievancesByDepartment() {
    const allResults = await Promise.all(DEPARTMENTS.map(async (dept) => {

        const cleanDept = dept.replace('BMC - ', '').trim();

        // 🔥 Better search query (broad + relevant)
        const searchQuery = `${cleanDept} Mumbai (issue OR problem OR complaint OR not working OR broken OR help)`;
        const query = encodeURIComponent(searchQuery);

        const url = `https://www.reddit.com/search.json?q=${query}&limit=15&sort=new`;

        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'GrievanceBot/1.0' }
            });

            const json = await response.json();

            const posts = json.data?.children
                .map(child => ({
                    title: child.data.title,
                    permalink: `https://reddit.com${child.data.permalink}`,
                    ups: child.data.ups,
                    created: new Date(child.data.created_utc * 1000).toLocaleString()
                }))
                .filter(post => isGrievance(post.title));

            return {
                department: dept,
                posts: posts || []
            };

        } catch (error) {
            console.error(`Error fetching ${dept}:`, error);
            return { department: dept, posts: [] };
        }
    }));

    return allResults;
}

// Usage
fetchGrievancesByDepartment()
    .then(data => console.log(JSON.stringify(data, null, 2)));