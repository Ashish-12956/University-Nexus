const { User, Student, Faculty, Admin, SubjectEnrollment, Announcement } = require('../models');
const UserService = require('../services/UserService');

async function seedData() {
  try {
    console.log('Seeding database with initial data...');

    // Create admin user
    const adminUser = await UserService.createUser(
      'admin@university.edu',
      'admin123',
      'System Administrator',
      'admin',
      'ADMIN001'
    );

    console.log('Admin user created:', adminUser.email);

    // Create sample faculty
    const faculty = await Faculty.create({
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      department: 'Computer Science',
      dob: '1980-05-15',
      contactNo: 9876543210,
      address: 'Faculty Quarters, University Campus',
      gender: 'Male',
      nationality: 'American',
      bloodGroup: 'O+',
      univId: 'FAC001',
      firebaseUid: 'faculty_firebase_uid_1'
    });

    console.log('Sample faculty created:', faculty.email);

    // Create sample student
    const student = await Student.create({
      name: 'Jane Doe',
      email: 'jane.doe@student.edu',
      course: 'Bachelor of Technology',
      branch: 'Computer Science',
      semester: 3,
      year: 2,
      rollNo: '2023CS001',
      dob: '2002-08-20',
      contactNo: 9123456789,
      address: 'Student Hostel, University Campus',
      gender: 'Female',
      nationality: 'Indian',
      bloodGroup: 'A+',
      parentContactNo: 9876543210,
      parentName: 'Robert Doe',
      parentOccupation: 'Engineer',
      univId: 'STU001',
      firebaseUid: 'student_firebase_uid_1'
    });

    console.log('Sample student created:', student.email);

    // Create sample subject enrollment
    const subject = await SubjectEnrollment.create({
      subjectName: 'Data Structures and Algorithms',
      subjectCode: 'CS201',
      credits: 4,
      facultyEmail: faculty.email
    });

    // Enroll student in subject
    await subject.addEnrolledStudents(student);

    console.log('Sample subject enrollment created:', subject.subjectName);

    // Create sample announcement
    const announcement = await Announcement.create({
      message: 'Welcome to the University Campus Management System! This is a sample announcement.'
    });

    console.log('Sample announcement created');

    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
