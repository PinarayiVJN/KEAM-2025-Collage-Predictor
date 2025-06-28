// --- Global Data & Mappings ---
const COURSE_MAP = {
    AD: "Artificial Intelligence and Data Science",
    AE: "Applied Electronics & Instrumentation",
    AG: "B.Tech. (Agrl. Engg.)",
    AH: "Artificial Intelligence and Machine Learning",
    AI: "Artificial Intelligence",
    AJ: "B.Tech Agriculture Engineering", // Note: AJ and AG seem similar, double-check your data
    AO: "Aeronautical Engineering",
    AU: "Automobile Engineering",
    BB: "Bio Technology and Biochemical Engineering",
    BE: "Computer Science & Engineering and Business Systems",
    BM: "Bio Medical Engineering",
    BR: "Biomedical and Robotic Engineering",
    BT: "Bio Technology",
    CB: "Cyber Physical Systems",
    CE: "Civil Engineering",
    CG: "Computer Science & Design",
    CH: "Chemical Engineering",
    CL: "Computer Science & Engg. (Artificial Intelligence & Machine Learning)",
    CO: "Computer Science & Engineering (Data Science)",
    CS: "Computer Science & Engineering",
    CT: "Computer Science & Engineering (Artificial Intelligence)",
    CU: "Computer Science and Business Systems",
    CV: "Civil and Environmental Engineering",
    CY: "Computer Science and Engineering (Cyber Security)",
    DS: "Dairy Technology",
    EB: "Electronics & Biomedical Engineering",
    EC: "Electronics & Communication",
    EE: "Electrical & Electronics Engineering",
    EI: "Electronics & Instrumentation",
    EL: "Electrical and Computer Engineering",
    EP: "Electronics and Computer Science",
    ES: "Electronics and Computer Engineering",
    EV: "Electronics Engineering (VLSI Design & Technology)",
    FS: "Safety & Fire Engineering",
    FT: "Food Technology",
    IC: "Instrumentation & Control Engg.",
    ID: "Computer Science and Engineering (Artificial Intelligence and Data Science)",
    IE: "Industrial Engineering",
    IO: "Computer Science and Engineering (Internet of Things)",
    IT: "Information Technology",
    MA: "Mechanical Engg. (Automobile)",
    ME: "Mechanical Engineering",
    MG: "Metallurgical and Materials Engineering",
    MR: "Mechatronics Engineering",
    PE: "Production Engineering",
    PO: "Polymer Engg.",
    PT: "Printing Technology",
    RA: "Robotics and Artificial Intelligence",
    RB: "Robotics & Automation",
    SB: "Naval Arch. & Ship Building"
};

const CATEGORY_MAP = {
    SM: "State Merit",
    EZ: "Ezhava",
    MU: "Muslim",
    LA: "Latin Catholic",
    BH: "Other Backward Hindu",
    DV: "Dheevara",
    VK: "Viswakarma",
    BX: "Kusavan",
    KN: "Kudumbi",
    KU: "Other Backward Christian",
    SC: "Scheduled Caste",
    ST: "Scheduled Tribe",
    EW: "EWS",
    // Special categories below are handled by checking the "Special Categories" string
    FW: "Fishermen/Worker",
    YN: "Nadar (SIUC)",
    CC: "Converts to Christianity",
    MG: "Malabar Muslim"
};

let allAllotmentData = {
    PHASE1: {},
    PHASE2: {}
}; // Will store all parsed JSON data

// --- DOM Elements ---
const rankInput = document.getElementById('keam-rank');
const categorySelect = document.getElementById('category');
const specialCategoryInput = document.getElementById('special-category-input');
const allBranchesRadio = document.getElementById('all-branches');
const specifiedBranchesRadio = document.getElementById('specified-branches');
const branchPreferencesContainer = document.getElementById('branch-preferences-container');
const branchPreferences = document.getElementById('branch-preferences');
const addPreferenceBtn = document.getElementById('add-preference-btn');
const predictBtn = document.getElementById('predict-btn');
const inputSection = document.getElementById('input-section');
const resultsSection = document.getElementById('results-section');
const sidebarRank = document.getElementById('sidebar-rank');
const sidebarCategory = document.getElementById('sidebar-category');
const sidebarSpecialCategory = document.getElementById('sidebar-special-category');
const sidebarBranches = document.getElementById('sidebar-branches');
const editInputBtn = document.getElementById('edit-input-btn');
const collegeGrid = document.getElementById('college-grid');

// --- Helper Functions ---

// Function to normalize rank values (handle '-' and null)
function parseRank(rankValue) {
    if (rankValue === '-' || rankValue === null || rankValue === undefined || rankValue === "") {
        return Infinity; // Treat as effectively no admission for this category/course
    }
    try {
        const parsed = parseInt(rankValue);
        return isNaN(parsed) ? Infinity : parsed;
    } catch (e) {
        console.warn("Could not parse rank:", rankValue, e);
        return Infinity;
    }
}

// Function to add a branch preference dropdown
function addBranchPreferenceDropdown(initialValue = '') {
    const div = document.createElement('div');
    div.className = 'branch-preference-item';

    const select = document.createElement('select');
    select.className = 'branch-dropdown';
    select.innerHTML = '<option value="">Select a Branch</option>';

    // Populate dropdown with all courses from COURSE_MAP
    for (const code in COURSE_MAP) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = COURSE_MAP[code];
        select.appendChild(option);
    }
    select.value = initialValue; // Set initial value if provided

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-preference-btn';
    removeBtn.innerHTML = '&times;'; // 'x' icon
    removeBtn.onclick = () => div.remove();

    div.appendChild(select);
    div.appendChild(removeBtn);
    branchPreferences.appendChild(div);
}

// --- Event Handlers ---

function toggleBranchPreferenceVisibility() {
    if (specifiedBranchesRadio.checked) {
        branchPreferencesContainer.classList.remove('hidden');
        if (branchPreferences.children.length === 0) {
            addBranchPreferenceDropdown(); // Add first dropdown if none exist
        }
    } else {
        branchPreferencesContainer.classList.add('hidden');
    }
}

async function handlePredict() {
    const userRank = parseInt(rankInput.value);
    const userCategory = categorySelect.value;
    const userSpecialCategories = specialCategoryInput.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s); // Split, trim, uppercase, remove empty

    if (isNaN(userRank) || userRank <= 0) {
        alert("Please enter a valid KEAM rank.");
        return;
    }
    if (!userCategory) {
        alert("Please select your category.");
        return;
    }

    let selectedBranches = [];
    if (specifiedBranchesRadio.checked) {
        const dropdowns = document.querySelectorAll('.branch-dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown.value) {
                selectedBranches.push(dropdown.value);
            }
        });
        if (selectedBranches.length === 0) {
            alert("Please select at least one branch preference, or choose 'All Branches'.");
            return;
        }
    }

    // Update sidebar with current input
    sidebarRank.textContent = userRank;
    sidebarCategory.textContent = CATEGORY_MAP[userCategory] || userCategory;
    sidebarSpecialCategory.textContent = userSpecialCategories.length > 0 ? userSpecialCategories.join(', ') : 'None';
    sidebarBranches.textContent = selectedBranches.length > 0 ? selectedBranches.map(code => COURSE_MAP[code] || code).join(', ') : 'All Branches';

    // Show loading or clear previous results
    collegeGrid.innerHTML = '<p class="no-results">Searching for colleges...</p>';
    resultsSection.classList.remove('hidden');
    inputSection.classList.add('hidden');

    // Perform prediction
    const eligibleColleges = await predictColleges(userRank, userCategory, userSpecialCategories, selectedBranches);
    displayColleges(eligibleColleges);
}

function handleEditInput() {
    inputSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
}

// --- Core Prediction Logic ---

async function loadAllotmentData() {
    const courseCodes = Object.keys(COURSE_MAP); // Get all known course codes

    for (const phase of ['PHASE1', 'PHASE2']) {
        for (const code of courseCodes) {
            const filePath = `data/${phase}/${code}.json`;
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    // It's expected some files might not exist if a course wasn't allotted in a phase
                    // console.warn(`File not found or error loading: ${filePath}. Skipping.`);
                    continue; // Skip to next file
                }
                const data = await response.json();
                allAllotmentData[phase][code] = data;
            } catch (error) {
                console.error(`Error fetching ${filePath}:`, error);
            }
        }
    }
    console.log("All allotment data loaded.", allAllotmentData);
    // After loading, ensure the first dropdown appears if specified is checked
    toggleBranchPreferenceVisibility();
}

async function predictColleges(userRank, userCategory, userSpecialCategories, selectedBranches) {
    const eligibleCollegesMap = new Map(); // Map to store colleges: CollegeCode -> { name, eligibleCourses: [] }

    // Iterate through phases
    for (const phaseKey of ['PHASE1', 'PHASE2']) {
        const phaseData = allAllotmentData[phaseKey];

        // Iterate through each course code that has data for this phase
        for (const courseCode in phaseData) {
            // If user specified branches, check if this course is among them
            if (selectedBranches.length > 0 && !selectedBranches.includes(courseCode)) {
                continue; // Skip this course if not selected
            }

            const collegesForCourse = phaseData[courseCode];
            
            collegesForCourse.forEach(collegeEntry => {
                const collegeCode = collegeEntry["College Code"];
                const collegeName = collegeEntry["Name of College"];

                // Determine the last rank for the user's category
                let lastRankForCategory = parseRank(collegeEntry[userCategory]);

                let isEligible = false;
                let eligibleRankReason = '';

                // 1. Check eligibility based on the main category
                if (userRank <= lastRankForCategory) {
                    isEligible = true;
                    eligibleRankReason = `(Last Rank ${lastRankForCategory})`;
                }

                // 2. Check for special category eligibility if not already eligible by main category
                // This logic assumes special categories provide eligibility if their code is present
                // AND the user's rank fits the SM (State Merit) rank.
                // This might need refinement based on exact KEAM special category rules if they have separate ranks.
                if (!isEligible && userSpecialCategories.length > 0) {
                    const collegeSpecialCategoriesString = collegeEntry["Special Categories"] || "";
                    const smRankForCollege = parseRank(collegeEntry["SM"]);

                    const hasMatchingSpecialCategory = userSpecialCategories.some(specialCat =>
                        collegeSpecialCategoriesString.includes(specialCat)
                    );

                    if (hasMatchingSpecialCategory && userRank <= smRankForCollege) {
                        isEligible = true;
                        eligibleRankReason = `(Eligible via Special Category, SM Last Rank ${smRankForCollege})`;
                    }
                }


                if (isEligible) {
                    if (!eligibleCollegesMap.has(collegeCode)) {
                        eligibleCollegesMap.set(collegeCode, {
                            code: collegeCode,
                            name: collegeName,
                            eligibleCourses: []
                        });
                    }
                    const collegeData = eligibleCollegesMap.get(collegeCode);

                    // Add eligible course to the college's list
                    // Prevent duplicates if a course is eligible in both phases or multiple times
                    const courseAlreadyAdded = collegeData.eligibleCourses.some(
                        c => c.code === courseCode && c.phase === phaseKey
                    );
                    if (!courseAlreadyAdded) {
                        collegeData.eligibleCourses.push({
                            code: courseCode,
                            name: COURSE_MAP[courseCode] || courseCode,
                            userRank: userRank,
                            lastRank: eligibleRankReason, // Display the relevant last rank for context
                            phase: phaseKey.replace('PHASE', 'Phase ') // "Phase 1" or "Phase 2"
                        });
                    }
                }
            });
        }
    }

    // Convert map values to an array and sort by college name for consistent display
    const sortedColleges = Array.from(eligibleCollegesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Sort eligible courses within each college for consistent display
    sortedColleges.forEach(college => {
        college.eligibleCourses.sort((a, b) => a.name.localeCompare(b.name));
    });

    return sortedColleges;
}

function displayColleges(colleges) {
    collegeGrid.innerHTML = ''; // Clear previous results

    if (colleges.length === 0) {
        collegeGrid.innerHTML = '<p class="no-results">No colleges found for your criteria. Try adjusting your rank or preferences.</p>';
        return;
    }

    colleges.forEach(college => {
        const card = document.createElement('div');
        card.className = 'college-card';

        const collegeNameEl = document.createElement('h3');
        collegeNameEl.className = 'college-name';
        collegeNameEl.textContent = college.name;
        card.appendChild(collegeNameEl);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'college-details';

        const collegeNameOnHover = document.createElement('h4');
        collegeNameOnHover.className = 'college-name-on-hover';
        collegeNameOnHover.textContent = college.name;
        detailsDiv.appendChild(collegeNameOnHover);


        const ul = document.createElement('ul');
        college.eligibleCourses.forEach(course => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${course.name}</strong><br>Your Rank: ${course.userRank} ${course.lastRank} - ${course.phase}`;
            ul.appendChild(li);
        });
        detailsDiv.appendChild(ul);

        card.appendChild(detailsDiv);

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.classList.add('hovered');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });

        collegeGrid.appendChild(card);
    });
}

// --- Initial Setup & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Load data first
    loadAllotmentData();

    // Initial state for branch preferences
    toggleBranchPreferenceVisibility(); // Call once on load

    // Add event listeners
    allBranchesRadio.addEventListener('change', toggleBranchPreferenceVisibility);
    specifiedBranchesRadio.addEventListener('change', toggleBranchPreferenceVisibility);
    addPreferenceBtn.addEventListener('click', addBranchPreferenceDropdown);
    predictBtn.addEventListener('click', handlePredict);
    editInputBtn.addEventListener('click', handleEditInput);

    // Initial setup: Hide results section
    resultsSection.classList.add('hidden');
});