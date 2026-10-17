/* =========================================
   REVIEW CATEGORIES
========================================= */

export const REVIEW_CATEGORIES = [
	{
		id: "technology",
		label: "Technology",
		description: "Ease of use and getting started",
	},
	{
		id: "refunds",
		label: "Refunds & Trust",
		description: "Purchase confidence and transparency",
	},
	{
		id: "results",
		label: "Results",
		description: "Practical usefulness and everyday organization",
	},
	{
		id: "family",
		label: "Family Coordination",
		description: "Sharing responsibilities and staying connected",
	},
	{
		id: "medical",
		label: "Medical Organization",
		description: "Medications, doctors, appointments, and records",
	},
	{
		id: "printables",
		label: "Printables",
		description: "Flexible paper-based organization",
	},
	{
		id: "daily-care",
		label: "Daily Care",
		description: "Feeling prepared for everyday responsibilities",
	},
] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number]["id"];

export type ReviewCard = {
	id: string;
	rating: number;
	headline: string;
	body: string;
	name: string;
	category: ReviewCategory;
};

type ReviewSeed = readonly [rating: number, headline: string, body: string];

/* =========================================
   UNIQUE SAMPLE NAMES
========================================= */

const SAMPLE_NAMES: Record<ReviewCategory, readonly string[]> = {
	technology: ["Samar T.", "Linda M.", "Carol R.", "Barbara K.", "Patricia W."],

	refunds: ["Susan H.", "Michael D.", "Jennifer B.", "Robert C.", "Nancy P."],

	results: [
		"Karen L.",
		"Thomas G.",
		"Deborah S.",
		"Elizabeth A.",
		"Richard F.",
	],

	family: ["Mary J.", "David R.", "Cynthia N.", "James P.", "Margaret E."],

	medical: ["Donna V.", "William H.", "Sandra L.", "Joseph M.", "Kathleen B."],

	printables: ["Janet C.", "Sharon D.", "Paul T.", "Brenda F.", "Diane W."],

	"daily-care": [
		"Laura S.",
		"Charles B.",
		"Rebecca M.",
		"Helen R.",
		"Daniel K.",
	],
};

/* =========================================
   STATIC REVIEW-STYLE SCENARIOS
   7 CATEGORIES × 5 ENTRIES
========================================= */

const REVIEW_CONTENT: Record<ReviewCategory, readonly ReviewSeed[]> = {
	/* 1. TECHNOLOGY */

	technology: [
		[
			5,
			"I'm not great with technology",
			"I'm not very comfortable with computers, so the printable option is what appealed to me. I like being able to work with paper instead of learning another app.",
		],
		[
			4,
			"Easier than I expected",
			"I usually avoid digital planners. The idea of starting with a few pages and filling in the rest later feels a lot more manageable to me.",
		],
		[
			5,
			"I still use pen and paper",
			"My daughter handles most of our online stuff, but I like to write things down. Having a version I can print is important to me.",
		],
		[
			5,
			"No complicated software",
			"I wasn't looking for another app to figure out. I wanted straightforward pages where I could keep track of appointments, medications, and important phone numbers.",
		],
		[
			4,
			"Something I could actually use",
			"I'm comfortable checking email and browsing websites, but spreadsheets are another story. Starting with the printable binder seems like the simplest approach.",
		],
	],

	/* 2. REFUNDS & TRUST */

	refunds: [
		[
			5,
			"I wanted to understand the refund policy",
			"I'm cautious about buying digital products because I've been disappointed before. I always read the refund conditions and product details before deciding.",
		],
		[
			4,
			"I had questions before buying",
			"I've purchased templates that looked different from the pictures, so I wanted to see exactly which files and pages were included this time.",
		],
		[
			5,
			"Knowing what's included matters",
			"I don't mind paying for something useful, but I want a clear description of what I'm getting. That's especially important with digital downloads.",
		],
		[
			4,
			"I like to check the details first",
			"With downloadable products, I always look for information about file formats, access, and refund terms. I prefer knowing those things before I pay.",
		],
		[
			5,
			"I don't buy digital products blindly",
			"I've learned to be careful with online purchases. A clear explanation of the product and where to get support makes a big difference to me.",
		],
	],

	/* 3. RESULTS & USEFULNESS */

	results: [
		[
			5,
			"I wasn't sure a binder would help",
			"I thought it might just be another planner sitting on a shelf. But having a dedicated place for medications, doctors, and appointments is exactly the kind of organization we need.",
		],
		[
			5,
			"I wish I'd started organizing sooner",
			"We had notes on our phones, paperwork in drawers, and information scattered everywhere. Keeping everything in one place makes so much more sense.",
		],
		[
			4,
			"It won't do the organizing for me",
			"I know I'll still need to gather all the information, and that takes time. Having a clear structure is what would make the task feel less overwhelming.",
		],
		[
			5,
			"Small things make a difference",
			"When you're helping an aging parent, even finding a phone number can take longer than it should. I like the idea of having those everyday details in one place.",
		],
		[
			5,
			"Exactly the kind of system I needed",
			"I wasn't looking for anything fancy. Just one place where I could find Mom's doctor information, medication list, and appointment notes when I need them.",
		],
	],

	/* 4. FAMILY COORDINATION */

	family: [
		[
			5,
			"My brother and I needed this",
			"My brother lives in another state, and most of Mom's care falls on me. We need a better way to share information without constantly going back through text messages.",
		],
		[
			4,
			"An overdue family conversation",
			"Nobody really wants to talk about who should handle what. Having some structure for that conversation would help us get started without turning it into an argument.",
		],
		[
			5,
			"We all need the same information",
			"There are three of us helping Dad. It's frustrating when one person knows something important and the others don't. A shared place for information makes sense.",
		],
		[
			5,
			"Caregiving shouldn't fall on one person",
			"I'm the daughter who lives closest to Mom, so I end up handling most things. I'd love a clearer way for my siblings to see what needs to be done.",
		],
		[
			4,
			"Getting everyone on the same page",
			"We don't always agree about Dad's care. I don't expect a planner to solve that, but having the facts written down would make our conversations more productive.",
		],
	],

	/* 5. MEDICAL ORGANIZATION */

	medical: [
		[
			5,
			"No more searching for medication lists",
			"Every time Dad has an appointment, I'm searching through my phone for his medication information. I want a printed list that I can update and bring with us.",
		],
		[
			5,
			"Too much paperwork everywhere",
			"Between Mom's prescriptions, appointment summaries, and insurance paperwork, our kitchen drawer is a mess. Having separate sections would make finding things easier.",
		],
		[
			4,
			"Helpful for doctor's appointments",
			"I always think of questions after we've left the doctor's office. A dedicated page for appointment notes and questions would be useful.",
		],
		[
			5,
			"All the important numbers together",
			"I have the pharmacy number saved in my phone, but my husband doesn't. I want the doctor's office, pharmacy, and emergency contacts written down somewhere we can both find.",
		],
		[
			5,
			"Keeping up with changing medications",
			"Mom's medication list changes occasionally, and it's hard to know which version is the latest. I like having one list that we can review and keep updated.",
		],
	],

	/* 6. PRINTABLES */

	printables: [
		[
			5,
			"I still prefer pen and paper",
			"I'm 62 and I honestly prefer writing things down. I like being able to print only the pages I need and keep them in a regular binder.",
		],
		[
			4,
			"I don't need every page right away",
			"Some sections would be useful for us now, and others probably won't be needed until later. I prefer something I can build gradually.",
		],
		[
			5,
			"I like having a physical copy",
			"My phone is convenient, but I still like having important information on paper. It's easier for other family members to find when I'm not around.",
		],
		[
			5,
			"Simple is better",
			"I don't need colorful trackers or complicated layouts. I want pages that are easy to read, easy to fill out, and practical enough to use every week.",
		],
		[
			4,
			"A little at a time works for me",
			"I wouldn't be able to organize everything in one afternoon. Having separate printable sections means I can work on it when I have time.",
		],
	],

	/* 7. DAILY CARE */

	"daily-care": [
		[
			5,
			"One less thing to think about",
			"Taking care of an aging parent comes with a hundred little details. It would be nice not to have to remember where every piece of information is.",
		],
		[
			5,
			"Something the whole family can use",
			"I want my husband and sister to know where important information is if I'm unavailable. Right now, too much of it is only in my head.",
		],
		[
			4,
			"Caregiving is a lot to manage",
			"I work full time and help my mom with appointments and errands. I don't need another complicated task, just a way to keep things a little more organized.",
		],
		[
			5,
			"Planning before there's an emergency",
			"Dad is doing well right now, but I don't want to wait until something happens to start gathering his important information. I'd rather be prepared.",
		],
		[
			5,
			"I needed somewhere to start",
			"Every time I think about organizing Mom's care, the list gets longer. Breaking it into smaller sections feels more realistic than trying to do everything at once.",
		],
	],
};

/* =========================================
   BUILD STATIC CATEGORY COLLECTION
========================================= */

export const REVIEW_TABS = REVIEW_CATEGORIES.map((category) => ({
	...category,

	reviews: REVIEW_CONTENT[category.id].map(
		([rating, headline, body], index): ReviewCard => ({
			id: `${category.id}-${index + 1}`,
			category: category.id,
			rating,
			headline,
			body,
			name: SAMPLE_NAMES[category.id][index],
		}),
	),
}));

export const ALL_REVIEWS: ReviewCard[] = REVIEW_TABS.flatMap(
	(category) => category.reviews,
);
