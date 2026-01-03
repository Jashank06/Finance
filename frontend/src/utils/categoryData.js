// Three-level category hierarchy for transaction categorization
export const categoryHierarchy = {
    "Income": {
        "Salary": [
            "Name of Company",
            "Other"
        ],
        "Business": [
            "Name of Company",
            "Other"
        ]
    },
    "Fixed & Contractual Costs (Needs)": {
        "Housing": [
            "Rent / Mortgage Payment",
            "Society Maintenance",
            "Other"
        ],
        "Utilities": [
            "Electricity",
            "Gas",
            "Water",
            "Sewer",
            "Trash Collection",
            "Home Internet",
            "WiFi",
            "Mobile",
            "Other"
        ],
        "Loan Repayments": [
            "Credit Card Payments",
            "Personal Loans",
            "Student Loans",
            "Auto Loans",
            "Home Loan",
            "Other"
        ],
        "Insurance Premiums": [
            "Term Life Insurance",
            "Health Insurance",
            "Home Insurance",
            "Auto Insurance",
            "Critical Illness Insurance",
            "Personal Accident / Disability Cover",
            "Travel Insurance",
            "Other"
        ],
        "Child Education": [
            "School Tuition Fees",
            "College Fees",
            "Annual School/University Charges",
            "Other"
        ],
        "Tax": [
            "Income Tax",
            "Advance Tax / Self-Assessment Tax",
            "Professional Tax",
            "Tax Advisory / Filing Fees",
            "Property Taxes",
            "Legal & Documentation",
            "Other"
        ]
    },
    "Variable Living Expenses (Needs - Daily/Monthly)": {
        "Groceries & Food, Fruits & Vegetables": [
            "Groceries & Staples",
            "Dairy & Bakery",
            "Packaged Goods",
            "Fruits & Vegetables",
            "Household Staples",
            "Cleaning supplies",
            "Toiletries",
            "Eating Out / Takeaways",
            "Other"
        ],
        "Transportation, Vehicle Expenses": [
            "Fuel/Gas",
            "Public Transport Fares",
            "Vehicle Maintenance & Repairs",
            "Registration/License Fees",
            "Cabs",
            "Parking / Tolls",
            "Other"
        ],
        "Household Expenses": [
            "Laundry",
            "Dry Cleaning",
            "Maintenance",
            "Minor Repairs (Plumbing, Electricals)",
            "Pest Control",
            "Toiletries",
            "Household Consumables",
            "Other"
        ],
        "Health & Medical": [
            "Prescription Medications",
            "Over-the-Counter Drugs",
            "Doctor/Specialist Copays",
            "Dental/Vision Expenses",
            "Therapy",
            "Routine Medical Expenses",
            "Medications (chronic / preventive)",
            "Diagnostics & Lab Tests",
            "Doctor Consultations",
            "Medical Equipment",
            "Other"
        ],
        "Apparel & Personal Care": [
            "Clothing",
            "Apparels",
            "Footwear & Accessories",
            "Haircuts/Salons",
            "Grooming & Personal Care",
            "Elderly Care Expenses",
            "Domestic Help / Caregivers",
            "Drivers",
            "Childcare / Daycare",
            "Special Needs (kids / seniors)",
            "Other"
        ],
        "Sin Expenses": [
            "Out-of-pocket hospital expenses",
            "Bribe",
            "Fines",
            "Late payment Charges",
            "Lost",
            "Theft",
            "Unclassified expenses",
            "Other"
        ]
    },
    "Financial Protection & Security (Goals - Mandatory)": {
        "Emergency Fund Buffer": [
            "Emergency Fund",
            "Other"
        ],
        "Debt Acceleration": [
            "Extra Principal Payment on Mortgage/Loans",
            "Other"
        ]
    },
    "Long-Term Savings & Investments (Goals - Future Wealth)": {
        "Retirement Fund": [
            "Pension Contributions",
            "Public Provident Fund",
            "Voluntary Savings",
            "Other"
        ],
        "College & Future Fund": [
            "Child's Higher Education / College Fund",
            "Child's Marriage / Major Life Event Fund",
            "Other"
        ],
        "Other Investments": [
            "General Brokerage Investments (Stocks, Mutual Funds, Bonds)",
            "Real Estate Investments",
            "Wealth Creation / Long-term Investments",
            "Other"
        ],
        "Down Payment": [
            "Investment for down payment",
            "Other"
        ]
    },
    "Discretionary & Lifestyle (Wants - Flexible)": {
        "Entertainment & Social": [
            "Dining Out/Takeout",
            "Entertainment & Subscriptions",
            "Movie Tickets",
            "Social Events",
            "Eating Out / Takeaways",
            "Other"
        ],
        "Personal Development": [
            "Books & Learning Material",
            "Online Courses/Certifications",
            "Fitness & Wellness",
            "Hobbies & Recreation",
            "Professional Certifications",
            "Self-Development Courses",
            "Conferences / Seminars",
            "Other"
        ],
        "Child's Growth": [
            "Extracurricular Activities",
            "Toys",
            "Tutoring",
            "Skill Development Classes",
            "Uniforms & Supplies",
            "School / Tuition Fees",
            "Coaching / Skill Development Classes",
            "Child's Growth & Development",
            "Other"
        ]
    },
    "Periodic & Large Expenses (Sinking Funds)": {
        "Vacation Fund": [
            "Monthly contribution to cover annual travel/vacation expenses",
            "Domestic Travel",
            "Vacation / Travel Fund",
            "International Travel",
            "Travel Activities",
            "Accommodation",
            "Other"
        ],
        "Rituals & Pilgrimage Fund": [
            "Dedicated savings for religious ceremonies",
            "Pilgrimage / Religious Travel",
            "Charity / Donations",
            "Tithing (Daan / Dharam)",
            "Rituals & Ceremonies",
            "Festivals & Religious Functions",
            "Other"
        ],
        "Home Furnishings, Furniture, Electricals / Electronics, Renovations": [
            "Furniture Purchases",
            "Home Renovations",
            "Major Appliance Replacement",
            "New Electronics Purchase",
            "Sinking Funds",
            "Home Renovation & Repairs",
            "Vehicle replacement fund",
            "Gadget replacement fund",
            "Other"
        ],
        "Repairs & Maintenance Reserve": [
            "Electricals & Electronics Maintenance",
            "Appliance AMC / Servicing",
            "Other"
        ],
        "Social Responsibility": [
            "Social Expenses (Marriages & Other Rituals & Functions, Relatives)",
            "Family Functions",
            "Family Responsibility",
            "Weddings",
            "Other"
        ]
    }
};

// Helper function to get all broader categories
export const getBroaderCategories = () => {
    return Object.keys(categoryHierarchy);
};

// Helper function to get main categories for a broader category
export const getMainCategories = (broaderCategory) => {
    if (!categoryHierarchy[broaderCategory]) {
        return [];
    }
    return Object.keys(categoryHierarchy[broaderCategory]);
};

// Helper function to get sub categories for a main category
export const getSubCategories = (broaderCategory, mainCategory) => {
    if (!categoryHierarchy[broaderCategory] || !categoryHierarchy[broaderCategory][mainCategory]) {
        return [];
    }
    return categoryHierarchy[broaderCategory][mainCategory];
};
