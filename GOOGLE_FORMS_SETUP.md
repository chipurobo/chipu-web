# Google Forms Integration Setup Guide

## Step 1: Create a New Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Click "Blank" to create a new form
3. Title: "ChipuRobo 2026 AI & Robotics Programme Registration"

## Step 2: Add Form Fields

Create these fields **in this exact order**:

### Field 1: School Name
- Type: Short answer
- Question: "School Name"
- Mark as Required

### Field 2: School Category  
- Type: Multiple choice
- Question: "School Category"
- Options:
  - Public Primary School
  - Public Secondary School
  - Private Primary School
  - Private Secondary School
  - Special Needs School
  - Technical/Vocational Institute
  - University/College
- Mark as Required

### Field 3: County
- Type: Dropdown
- Question: "County"
- Add all 47 Kenyan counties as options
- Mark as Required

### Field 4: Contact Person
- Type: Short answer
- Question: "Contact Person Name"
- Mark as Required

### Field 5: Email
- Type: Short answer
- Question: "Email Address"
- Enable "Response validation" > "Email"
- Mark as Required

### Field 6: Phone
- Type: Short answer
- Question: "Phone Number"
- Mark as Required

### Field 7: Programs of Interest
- Type: Checkboxes
- Question: "Which programs are you interested in?"
- Options:
  - Code Club (Raspberry Pi Computing)
  - AI & Robotics Bootcamp
  - Maker Space Setup
  - Teacher Professional Development
  - Inclusive Technology Program

### Field 8: Comments
- Type: Paragraph
- Question: "Additional Comments or Special Requirements"
- Optional

## Step 3: Get Form Configuration

1. Click the "Send" button in your Google Form
2. Click the link icon (<>)
3. Copy the form URL - it looks like: `https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform`

4. **Get the form action URL:**
   - Replace `/viewform` with `/formResponse` in the URL
   - Example: `https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse`

5. **Get field entry IDs:**
   - Right-click on your form preview and select "View Page Source"
   - Search for "entry." - you'll find IDs like `entry.123456789`
   - Map each field to its entry ID in order:

```javascript
const FORM_FIELDS = {
  schoolName: "entry.XXXXXXXXX",      // Field 1 entry ID
  schoolCategory: "entry.XXXXXXXXX",   // Field 2 entry ID  
  county: "entry.XXXXXXXXX",           // Field 3 entry ID
  contactPerson: "entry.XXXXXXXXX",    // Field 4 entry ID
  email: "entry.XXXXXXXXX",            // Field 5 entry ID
  phone: "entry.XXXXXXXXX",            // Field 6 entry ID
  programs: "entry.XXXXXXXXX",         // Field 7 entry ID
  comments: "entry.XXXXXXXXX"          // Field 8 entry ID
};
```

## Step 4: Update Registration2026.tsx

Replace the placeholder values in `/src/components/Registration2026.tsx`:

1. Update `GOOGLE_FORM_URL` with your form's `/formResponse` URL
2. Update each field in `FORM_FIELDS` with the correct entry IDs

## Step 5: Set up Response Destination

1. In your Google Form, click "Responses"
2. Click the Google Sheets icon to create a spreadsheet
3. Name it "ChipuRobo 2026 Registrations"
4. All form submissions will now appear in this spreadsheet automatically

## Step 6: Configure Notifications (Optional)

1. In your Google Sheets, go to Tools > Notification Rules
2. Set up email notifications for new form responses
3. You'll get notified every time someone registers

## Testing

1. Test your form by submitting a registration
2. Check that data appears in your Google Sheets
3. Verify all fields are captured correctly

## Example Configuration

Here's what your updated Registration2026.tsx should look like:

```javascript
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc_YOUR_ACTUAL_FORM_ID/formResponse";

const FORM_FIELDS = {
  schoolName: "entry.1234567890",
  schoolCategory: "entry.0987654321", 
  county: "entry.1122334455",
  contactPerson: "entry.5544332211",
  email: "entry.6677889900",
  phone: "entry.9988776655",
  programs: "entry.1357924680",
  comments: "entry.2468013579"
};
```

## Benefits of This Setup

✅ **Automatic Data Collection** - All submissions go directly to Google Sheets
✅ **Real-time Updates** - See registrations as they come in
✅ **No Email Clutter** - Clean, organized data in spreadsheet format
✅ **Easy Analysis** - Export data, create charts, filter by county/category
✅ **Backup & Security** - Google handles data storage and backup
✅ **Collaboration** - Share spreadsheet with team members
✅ **Notifications** - Get alerts for new registrations

## Troubleshooting

- **Form not submitting?** Check that field entry IDs match exactly
- **Data missing?** Ensure all required fields have the correct entry IDs  
- **CORS errors?** Normal with Google Forms - submissions still work
- **Need to test?** Submit a test registration and check your spreadsheet