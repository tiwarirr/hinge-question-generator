# Hinge Question Generator — User Guide

## What is a Hinge Question?

A Hinge Question is a diagnostic multiple-choice question asked at a critical point in a lesson to check whether students have understood a concept before moving on. Each wrong answer (called a "distractor") reveals a specific misconception that the student has.

**Example:**
> What is the degree of the polynomial 5x³y² + 2x²y⁴?
> - A) 6 ← Correct
> - B) 5 ← Misconception: Added exponents incorrectly
> - C) 3 ← Misconception: Only looked at one variable
> - D) 4 ← Misconception: Confused degree with number of terms

---

# For Teachers

## Getting Started

### Step 1: Create Your Account

1. Open the app in your browser
2. Click **"Register"**
3. Enter your **Name**, **Email**, and **Password**
4. Click **"Create account"**
5. You will be logged in automatically

### Step 2: Generate Hinge Questions

1. Click **"Generate Questions"** in the left sidebar
2. Fill in the form:
   - **Topic** (required): The subject you are teaching (e.g., "Photosynthesis", "Fractions", "World War II")
   - **Subtopic** (optional): A specific area within the topic (e.g., "Light reactions", "Equivalent fractions")
   - **Number of Questions**: How many to generate (1-10)
   - **Grade Level**: The level of your students
3. Click **"Generate Questions"**
4. Wait for the AI to generate your questions (usually 10-30 seconds)
5. Review the generated questions:
   - Each question shows the **stem** (the question text)
   - Each answer option is labeled as **Correct** or **Distractor**
   - Distractors show the **Misconception** they reveal
6. You can **Edit** any question or **Remove** it
7. Click **"Save All to My Questions"** when satisfied

> **Note:** You need an API key set up for AI generation to work. Contact your administrator if generation fails.

### Step 3: Create a Quiz Session

1. Click **"New Session"** in the left sidebar
2. Enter a **Session Title** (e.g., "Photosynthesis Quiz - Period 3")
3. Select a **Topic** from the dropdown (this filters your saved questions)
4. **Check the boxes** next to the questions you want to include
5. Click **"Create Session"**
6. You will see a **6-character join code** (e.g., `A3K7PX`)
7. Share this code with your students (write on board, announce verbally, etc.)

### Step 4: View the Diagnostic Report

Once students have submitted their answers:

1. Go to the **Dashboard** and click **"Report"** next to the session, OR
2. Click **"View Report"** on the session confirmation page

The report shows:

- **Overall Score**: Percentage of correct answers across all questions
- **Question Performance**: A bar chart showing how students performed on each question
- **Misconception Map**: A ranked list of misconceptions, showing which ones are most common
- **Detailed Breakdown**: For each question, shows how many students chose each option and what misconception it reveals
- **AI Recommendations**: Suggested reteaching strategies based on the misconceptions found

### Step 5: Manual Response Entry (Optional)

If students answered on paper instead of on their devices:

1. Click **"Manual Entry"** on the session confirmation page, OR
2. Go to the session and click the manual entry option
3. Enter the **Student Name**
4. Click the answer option the student selected for each question
5. Click **"Submit & Add Next Student"**
6. Repeat for each student

### Exporting Reports

Click **"Export CSV"** on the report page to download a spreadsheet with:
- Per-question performance data
- Misconception summary
- Can be opened in Excel or Google Sheets

---

# For Students

## Joining a Quiz

### Step 1: Get the Code

Your teacher will give you a **6-character code** (e.g., `A3K7PX`). This might be:
- Written on the whiteboard
- Announced verbally
- Shared via your class communication tool

### Step 2: Open the Link

1. Open your web browser (Chrome, Firefox, Safari, Edge — any browser works)
2. Go to the URL your teacher provides (e.g., `http://localhost:5176/join/A3K7PX`)
3. Or navigate to the app and add `/join/` followed by the code

> **Tip:** This works on phones, tablets, laptops, and desktops.

### Step 3: Enter Your Name

1. Type your name in the **"Your Name"** field
2. Click **"Join & Start"**

### Step 4: Answer the Questions

1. Read each question carefully
2. Click the answer you think is correct (A, B, C, or D)
3. Your answer is submitted automatically
4. The next question appears
5. A progress bar at the top shows how many questions remain

### Step 5: Completion

After answering all questions, you will see a confirmation screen:
> "All Done! Thank you, [Your Name]. Your responses have been recorded."

You can close the browser tab now.

---

## Frequently Asked Questions

### For Teachers

**Q: Can I edit questions after generating them?**
A: Yes. After generating, click "Edit question" on any question card to modify the text. You can also remove individual questions before saving.

**Q: Can I reuse questions in multiple sessions?**
A: Yes. Saved questions stay in your question bank. You can create multiple sessions using the same questions.

**Q: What if I don't have an API key?**
A: You can still use manual response entry and view reports. AI question generation requires an API key.

**Q: Can students see the correct answers?**
A: No. Students only see the question and options. They do not see whether their answer was correct. This is a diagnostic tool, not a graded quiz.

**Q: How do I close a session?**
A: Currently, sessions remain open. You can stop sharing the code when you want to stop accepting responses.

**Q: Can I export the data?**
A: Yes. Click "Export CSV" on the report page to download a spreadsheet.

### For Students

**Q: Do I need to create an account?**
A: No. Just enter the join code and your name.

**Q: What if I enter the wrong answer?**
A: Answers are submitted immediately when you click. There is no way to change your answer after clicking. Read carefully before choosing.

**Q: Can I use my phone?**
A: Yes. The page works on any device with a web browser.

**Q: What if the page doesn't load?**
A: Check that you typed the code correctly. Make sure you have an internet connection. Try refreshing the page.

**Q: Will I see my score?**
A: No. This is a diagnostic tool for your teacher to understand what concepts need review. You will not see individual results.

---

## Quick Reference

### Teacher Workflow
```
Register/Login → Generate Questions → Save Questions → Create Session → Share Code → View Report
```

### Student Workflow
```
Get Code → Open Link → Enter Name → Answer Questions → Done
```

### Key URLs (when running locally)
| Page | URL |
|------|-----|
| Teacher Login | http://localhost:5176/login |
| Teacher Register | http://localhost:5176/register |
| Dashboard | http://localhost:5176/ |
| Generate Questions | http://localhost:5176/generate |
| My Questions | http://localhost:5176/questions |
| New Session | http://localhost:5176/session/new |
| Student Join | http://localhost:5176/join/CODE |
| Report | http://localhost:5176/report/SESSION_ID |
