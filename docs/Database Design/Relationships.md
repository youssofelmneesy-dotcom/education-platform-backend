Tenant
 ├── Users
 ├── Courses
 ├── Categories
 ├── Orders
 ├── Payments

User
 ├── Profile (1:1)
 ├── Roles (M:N)
 ├── Courses (Teacher)
 ├── Orders
 ├── Payments
 ├── Notifications
 ├── Certificates

Role
 ├── Permissions (M:N)

Course
 ├── Lessons (1:N)
 ├── Reviews (1:N)
 ├── Categories (M:N)
 ├── Tags (M:N)
 ├── Teachers (M:N)
 ├── Exams (1:N)
 ├── Assignments (1:N)

Lesson
 ├── Video (1:1)
 ├── Attachments (1:N)

Video
 ├── Chapters (1:N)
 ├── Subtitles (1:N)
 ├── WatchProgress (1:N)

Exam
 ├── Questions (1:N)
 ├── Attempts (1:N)
 ├── Results (1:N)

Assignment
 ├── Submissions (1:N)

Order
 ├── Payment (1:1)
 ├── OrderItems (1:N)

Notification
 ├── NotificationLogs (1:N)