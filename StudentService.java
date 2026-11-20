package com.student.student_management.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.student.student_management.entity.Student;
import com.student.student_management.repository.StudentRepository;

@Service
public class StudentService {
     private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    public Student addStudent(Student student) {
        return repository.save(student);
    }
    
    public Student updateStudent(Long id, Student updatedStudent) {

        Student existingStudent = repository.findById(id).orElse(null);

        if (existingStudent != null) {
            existingStudent.setName(updatedStudent.getName());
            existingStudent.setEmail(updatedStudent.getEmail());
            existingStudent.setAge(updatedStudent.getAge());
            existingStudent.setCourse(updatedStudent.getCourse());

            return repository.save(existingStudent);
        }

        return null;
    }

    public Student getStudentById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteStudent(Long id) {
        repository.deleteById(id);
    }
}

