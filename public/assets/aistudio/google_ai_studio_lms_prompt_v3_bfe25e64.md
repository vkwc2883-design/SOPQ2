# Role & Objective

You are an elite software architect and AI engineer. Your task is to build a robust, production-ready, single-file Learning Management System (LMS) web application using Python and Streamlit. 

# CRITICAL TECHNICAL REQUIREMENTS

1. **AI Model Configuration:** You **must** use the latest `gemini-3.8-flash` model for all generative tasks (e.g., `client.models.generate_content(model="gemini-3.8-flash", ...)`). Do not use legacy model names like `gemini-2.5-flash` or `gemini-1.5-flash`.
2. **Preventing Infinite Loops:** 
   - Never use `st.rerun()` inside form submissions or button handlers.
   - Use direct session-state assignments and let Streamlit's native reactive rendering handle UI updates.
   - Isolate the Gemini API call behind a single-execution condition to prevent recursive re-runs.

# Core Modules & Specifications

## 1. Authentication & Role-Based Access Control (RBAC)
- **Login Screen**: Secure username and password fields validating against pre-seeded mock users stored in `st.session_state`.
- **Roles & Permissions**:
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
When a Manager navigates to the "Assign Quiz" section, present a clean form containing:
1. **Select Staff**: Multiselect dropdown of active staff members.
2. **Select Job Function Document**: Dropdown of uploaded job function documents.
3. **Number of Questions**: Numeric input or slider ranging from **1 to 30 questions**.
4. **Action Button**: "Generate & Assign Quiz".

### Safe Implementation Logic for Quiz Generation:
```python
# Safe form submission handling without infinite loops
if submitted:
  if not selected_staff or not selected_doc:
    st.error("Please select both staff members and a source document.")
  else:
    with st.spinner("Generating quiz questions with Gemini..."):
      try:
        # Call Gemini API once using gemini-3.8-flash
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=(
                f"Create {num_questions} multiple-choice questions based on"
                f" this document: {doc_content}"
            ),
        )

        # Parse and assign to selected staff members
        for staff in selected_staff:
          st.session_state.quizzes.append({
              "id": str(uuid.uuid4()),
              "staff": staff,
              "document": selected_doc,
              "questions": parse_quiz_response(response.text),
              "status": "Pending",
              "score": None,
          })
        st.success("Quiz successfully generated and assigned!")
      except Exception as e:
        st.error(f"Failed to generate quiz: {e}")
```

## 4. Quiz Taking & Grading Engine
- Staff members select a pending quiz from their dashboard.
- Interactive questionnaire form where they select answers.
- Instant automated grading upon submission, calculating the final percentage score and updating the central gradebook automatically.

## 5. Staff Gradebook Module
- **For Managers/Admins**: Comprehensive table displaying all staff quiz records (Staff Name, Document Title, Score, Completion Date, Status), filterable by staff member.
- **For Staff**: Personal performance history dashboard.