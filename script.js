
const API_URL = "http://localhost:8080/students";

const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const courseCount = document.getElementById("courseCount");
const courseFilter = document.getElementById("courseFilter");
let currentPage = 1;
const rowsPerPage = 5;

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumber = document.getElementById("pageNumber");
const studentCount = document.getElementById("studentCount");
const searchInput = document.getElementById("searchInput");
const sortStudents = document.getElementById("sortStudents");

// Get all students
async function getStudents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Unable to fetch students");
        }
        const students = await response.json();
        const uniqueCourses = new Set(
            students.map(student => student.course.toLowerCase().trim())
        );

        courseCount.textContent = uniqueCourses.size;
        courseFilter.innerHTML = '<option value="">All Courses</option>';

        uniqueCourses.forEach(course => {
            const option = document.createElement("option");

            option.value = course;
            option.textContent = course;

            courseFilter.appendChild(option);
        });
        studentCount.textContent = students.length;

        studentTable.innerHTML = "";

        students.forEach(student => {
            const row = document.createElement("tr");

            [student.id, student.name, student.email,
            student.age, student.course].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            editButton.onclick = function () {
                editStudent(student);
            };

            actionCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.onclick = function () {
                deleteStudent(student.id);
            };

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            studentTable.appendChild(row);
        });
        currentPage = 1;
        displayPage();
    } catch (error) {
        console.error("Error:", error);
        alert("Unable to load students. Check your backend.");
    }
}

// Add student
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        age: Number(document.getElementById("age").value),
        course: document.getElementById("course").value
    };
    if (student.name.trim() === "") {
        alert("Please enter student name.");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (student.course.trim() === "") {
        alert("Please enter course name.");
        return;
    }
    if (student.age <= 0) {
        alert("Please enter a valid age.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            throw new Error("Unable to add student");
        }

        alert("Student added successfully!");

        form.reset();
        getStudents();

    } catch (error) {
        console.error("Error:", error);
        alert("Unable to add student. Check your backend.");
    }
});

// Load students when page opens
getStudents();
// Delete a student
async function deleteStudent(id) {
    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete student");
        }

        alert("Student deleted successfully!");
        getStudents();

    } catch (error) {
        console.error("Error:", error);
        alert("Unable to delete student.");
    }
}

// Edit a student
async function editStudent(student) {

    const name = prompt("Enter Name:", student.name);
    const email = prompt("Enter Email:", student.email);
    const age = prompt("Enter Age:", student.age);
    const course = prompt("Enter Course:", student.course);

    if (name === null || email === null ||
        age === null || course === null) {
        return;
    }

    const updatedStudent = {
        name: name,
        email: email,
        age: Number(age),
        course: course
    };

    try {
        const response = await fetch(`${API_URL}/${student.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        });

        if (!response.ok) {
            throw new Error("Unable to update student");
        }

        alert("Student updated successfully!");
        getStudents();

    } catch (error) {
        console.error("Error:", error);
        alert("Unable to update student.");
    }
}

searchInput.addEventListener("input", function () {
    currentPage = 1;
    displayPage();
});

courseFilter.addEventListener("change", function () {
    currentPage = 1;
    displayPage();
});
// Export students to CSV
document.getElementById("exportBtn").addEventListener("click", function () {

    const rows = studentTable.getElementsByTagName("tr");

    let csv = "ID,Name,Email,Age,Course\n";

    for (let i = 0; i < rows.length; i++) {

        if (rows[i].style.display === "none") {
            continue;
        }

        const cells = rows[i].getElementsByTagName("td");

        const studentData = [];

        for (let j = 0; j < 5; j++) {
            studentData.push('"' + cells[j].textContent.replace(/"/g, '""') + '"');
        }

        csv += studentData.join(",") + "\n";
    }

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";

    link.click();

    URL.revokeObjectURL(url);
});
// Pagination function
function displayPage() {

    const rows = Array.from(studentTable.getElementsByTagName("tr"));

    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedCourse = courseFilter.value;

    const filteredRows = rows.filter(row => {

        const name = row.cells[1].textContent.toLowerCase();
        const course = row.cells[4].textContent.toLowerCase();

        return name.includes(searchValue) &&
            (selectedCourse === "" || course === selectedCourse);
    });
    if (sortStudents.value === "asc") {
        filteredRows.sort((a, b) =>
            a.cells[1].textContent.localeCompare(b.cells[1].textContent)
        );
    }

    if (sortStudents.value === "desc") {
        filteredRows.sort((a, b) =>
            b.cells[1].textContent.localeCompare(a.cells[1].textContent)
        );
    }

    const totalPages = Math.max(
        1, Math.ceil(filteredRows.length / rowsPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    rows.forEach(row => {
        row.style.display = "none";
    });

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    filteredRows.slice(start, end).forEach(row => {
        row.style.display = "";
    });

    pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;

    previousBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
// Previous page button
previousBtn.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        displayPage();
    }
});

// Next page button
nextBtn.addEventListener("click", function () {
    currentPage++;
    displayPage();
});
sortStudents.addEventListener("change", function () {
    currentPage = 1;
    displayPage();
});