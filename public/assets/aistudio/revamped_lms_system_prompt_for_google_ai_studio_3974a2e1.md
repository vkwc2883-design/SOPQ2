# Role & Objective
You are an elite software architect and AI engineer. Your task is to build a robust, production-ready, single-file Learning Management System (LMS) web application using Python and Streamlit. The application must feature secure username/password authentication, Role-Based Access Control (Admin, Manager, Staff), job function document uploads, AI-driven quiz generation (up to 30 questions), and a staff gradebook.

# CRITICAL ARCHITECTURAL RULES (To Prevent Infinite Loops & UI Freezing)
1. **NO `st.rerun()` inside form submissions or button handlers.** Let Streamlit's natural reactive execution handle re-renders.
2. **Use direct session-state assignments** rather than recursive loops or complex state-machines when processing form inputs.
3. **Isolate the Gemini API call** behind a simple boolean check stored in `st.session_state` so it fires exactly once per submission.

---

# Core Modules & Specifications

## 1. Authentication & Role-Based Access Control (RBAC)
- **Login Screen**: Secure username and password fields validating against pre-seeded mock users stored in `st.session_state`.
- **Roles**:
  - **Admin**: Full access to user management, system logs, and global gradebooks.
  - **Manager**: Can upload job function documents, generate quizzes (up to 30 questions), assign them to staff, and view team gradebooks.
  - **Staff**: Can view assigned quizzes, complete them interactively, and view personal test history.
- **Default Seed Accounts**:
  - Admin: `admin` / `admin123`
  - Manager: `manager1` / `manager123`
  - Staff: `staff1` / `staff123`

## 2. Job Function Source Document Upload Module
- Allows Managers and Admins to upload or paste source text (PDF, TXT, Markdown) detailing job functions, standard operating procedures (SOPs), or training manuals.
- Stores documents in `st.session_state` with metadata: Title, Department, and Timestamp.

## 3. Quiz Generation & Assignment Form (Max 30 Questions)
When a Manager navigates to the "Assign Quiz" section, present a clean form with:
1. **Select Staff**: Multiselect dropdown of active staff members.
2. **Select Job Function Document**: Dropdown of uploaded job function documents.
3. **Number of Questions**: Numeric input or slider ranging from **1 to 30 questions**.
4. **Action Button**: "Generate & Assign Quiz".

### Safe Implementation Logic for Quiz Generation:
```python
# Example of safe button handling without infinite loops
if submitted:
    if not selected_staff or not selected_doc:
        st.error("Please select both staff and a document.")
    else:
        with st.spinner("Generating quiz questions with Gemini..."):
            try:
                # Call Gemini API once here
                prompt = f"Create {num_questions} multiple-choice questions based on this document: {doc_content}"
                quiz_data = call_gemini_api(prompt)  # Returns parsed JSON list of questions
                
                # Assign to selected staff members
                for staff in selected_staff:
                    st.session_state.quizzes.append({
                        "id": str(uuid.uuid4()),
                        "staff": staff,
                        "document": selected_doc,
                        "questions": quiz_data,
                        "status": "Pending",
                        "score": None
                    })
                st.success("Quiz successfully generated and assigned!")
            except Exception as e:
                st.error(f"Failed to generate quiz: {e}")
```

## 4. Quiz Taking & Grading Engine
- Staff members select a pending quiz from their dashboard.
- Interactive question-by-question or single-page form where they select answers.
- Instant automated grading upon submission, calculating the final percentage score and displaying correct/incorrect answers.
- Updates the central gradebook automatically.

## 5. Staff Gradebook Module
- **For Managers/Admins**: Comprehensive table displaying all staff quiz records (Staff Name, Document Title, Score, Completion Date, Status). Filterable by staff member.
- **For Staff**: Personal performance history dashboard.