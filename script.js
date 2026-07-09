// Khởi tạo dữ liệu từ LocalStorage hoặc mảng rỗng
let data = [];
try {
    data = JSON.parse(localStorage.getItem('gpa_data')) || [];
    if (!Array.isArray(data)) data = [];
} catch (e) {
    console.error("Dữ liệu lưu trữ bị lỗi, khởi tạo lại từ đầu.", e);
    data = [];
}

// Các tỷ lệ phần trăm có sẵn
const percentageOptions = [
    { label: "20% QT - 80% CK", qt: 20, ck: 80 },
    { label: "30% QT - 70% CK", qt: 30, ck: 70 },
    { label: "40% QT - 60% CK", qt: 40, ck: 60 },
    { label: "50% QT - 50% CK", qt: 50, ck: 50 }
];

// HÀM: Xử lý input điểm số với format x,y
function handleScoreInput(inputElement, semIdx, courseIdx, field) {
    let value = inputElement.value.replace(/[^0-9,]/g, '');
    let commaIndex = value.indexOf(',');

    if (commaIndex !== -1) {
        let beforeComma = value.substring(0, commaIndex);
        let afterComma = value.substring(commaIndex + 1);

        if (beforeComma.length > 0) {
            let intPart = parseInt(beforeComma);
            if (intPart > 10) beforeComma = '10';
            if (intPart < 0) beforeComma = '0';
        }

        if (afterComma.length > 1) {
            afterComma = afterComma.substring(0, 1);
        }

        if (afterComma && (parseInt(afterComma) < 0 || parseInt(afterComma) > 9)) {
            afterComma = '';
        }

        value = beforeComma + ',' + afterComma;
    } else {
        if (value.length > 0) {
            let intValue = parseInt(value);
            if (intValue > 10) value = '10';
            if (intValue < 0) value = '0';
        }
    }

    inputElement.value = value;
    let numericValue = value.replace(',', '.');
    let floatValue = parseFloat(numericValue);
    if (isNaN(floatValue)) floatValue = 0;
    floatValue = Math.min(Math.max(floatValue, 0), 10);

    updateValue(semIdx, courseIdx, field, floatValue);
}

// HÀM: Xử lý phím tắt cho input điểm
function handleScoreKeydown(event, inputElement, semIdx, courseIdx, field) {
    const value = inputElement.value;
    const commaIndex = value.indexOf(',');

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'Tab' || event.key === 'Delete') {
        return;
    }

    if (event.key === ',' || event.key === '.') {
        event.preventDefault();
        if (commaIndex === -1) {
            const cursorPos = inputElement.selectionStart;
            const newValue = value.substring(0, cursorPos) + ',' + value.substring(cursorPos);
            inputElement.value = newValue;
            inputElement.setSelectionRange(cursorPos + 1, cursorPos + 1);

            let numericValue = newValue.replace(',', '.');
            let floatValue = parseFloat(numericValue);
            if (isNaN(floatValue)) floatValue = 0;
            updateValue(semIdx, courseIdx, field, floatValue);
        }
        return;
    }

    if (event.key === 'Backspace') {
        setTimeout(() => {
            handleScoreInput(inputElement, semIdx, courseIdx, field);
        }, 0);
        return;
    }

    if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();

        const cursorPos = inputElement.selectionStart;
        let newValue = value;

        if (commaIndex === -1) {
            if (cursorPos === value.length) {
                newValue = value + event.key;
            } else {
                newValue = value.substring(0, cursorPos) + event.key + value.substring(cursorPos);
            }

            const beforeComma = newValue;
            if (beforeComma.length > 0 && parseInt(beforeComma) > 10) {
                newValue = '10';
            }
        } else {
            if (cursorPos <= commaIndex) {
                let beforeComma = value.substring(0, commaIndex);
                let afterComma = value.substring(commaIndex + 1);

                if (cursorPos === beforeComma.length) {
                    beforeComma = beforeComma + event.key;
                } else {
                    beforeComma = beforeComma.substring(0, cursorPos) + event.key + beforeComma.substring(cursorPos);
                }

                if (beforeComma.length > 0 && parseInt(beforeComma) > 10) {
                    beforeComma = '10';
                }

                newValue = beforeComma + ',' + afterComma;
            } else {
                let beforeComma = value.substring(0, commaIndex);
                let afterComma = value.substring(commaIndex + 1);

                const decimalPos = cursorPos - commaIndex - 1;
                if (decimalPos >= afterComma.length) {
                    afterComma = afterComma + event.key;
                } else {
                    afterComma = afterComma.substring(0, decimalPos) + event.key + afterComma.substring(decimalPos);
                }

                if (afterComma.length > 1) {
                    afterComma = afterComma.substring(0, 1);
                }

                newValue = beforeComma + ',' + afterComma;
            }
        }

        inputElement.value = newValue;

        if (cursorPos < newValue.length) {
            inputElement.setSelectionRange(cursorPos + 1, cursorPos + 1);
        } else {
            inputElement.setSelectionRange(newValue.length, newValue.length);
        }

        let numericValue = newValue.replace(',', '.');
        let floatValue = parseFloat(numericValue);
        if (isNaN(floatValue)) floatValue = 0;
        updateValue(semIdx, courseIdx, field, floatValue);
    }
}

// HÀM: Format điểm số thành chuỗi x,y
function formatScoreWithComma(score) {
    if (typeof score !== 'number' || isNaN(score)) return '0,0';
    const rounded = Math.round(score * 10) / 10;
    return rounded.toFixed(1).replace('.', ',');
}

// HÀM: Format GPA với 2 chữ số thập phân
function formatGPAWithTwoDecimals(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0,00';
    return num.toFixed(2).replace('.', ',');
}

// HÀM: Validate tín chỉ
function validateCredit(credit) {
    let num = parseFloat(credit);
    if (isNaN(num)) return 0;
    num = Math.max(Math.round(num), 0);
    return num;
}

// HÀM: Validate điểm số
function validateScore(score) {
    let num = parseFloat(score);
    if (isNaN(num)) return 0;
    return Math.min(Math.max(num, 0), 10);
}

// Hàm lấy điểm chữ và GPA
function getGradeInfo(score) {
    if (score >= 8.5) return { letter: 'A', gpa4: 4.0, gpa3: 4.0 };
    if (score >= 8.0) return { letter: 'B+', gpa4: 3.5, gpa3: 3.5 };
    if (score >= 7.0) return { letter: 'B', gpa4: 3.0, gpa3: 3.0 };
    if (score >= 6.5) return { letter: 'C+', gpa4: 2.5, gpa3: 2.5 };
    if (score >= 5.5) return { letter: 'C', gpa4: 2.0, gpa3: 2.0 };
    if (score >= 5.0) return { letter: 'D+', gpa4: 1.5, gpa3: 1.5 };
    if (score >= 4.0) return { letter: 'D', gpa4: 1.0, gpa3: 1.0 };
    return { letter: 'F', gpa4: 0.0, gpa3: 0.0 };
}

// Hàm lấy đánh giá học lực
function getAcademicEvaluation(score) {
    if (score >= 8.5) return "Xuất sắc";
    if (score >= 8.0) return "Giỏi";
    if (score >= 7.0) return "Khá";
    if (score >= 6.5) return "Trung bình khá";
    if (score >= 5.5) return "Trung bình";
    if (score >= 5.0) return "Trung bình yếu";
    if (score >= 4.0) return "Yếu";
    return "Kém";
}

// Hàm lấy màu cho điểm chữ
function getGradeColorClass(letter) {
    switch (letter) {
        case 'A': return 'grade-A';
        case 'B+': return 'grade-B';
        case 'B': return 'grade-B';
        case 'C+': return 'grade-C';
        case 'C': return 'grade-C';
        case 'D+': return 'grade-D';
        case 'D': return 'grade-D';
        case 'F': return 'grade-F';
        default: return '';
    }
}

// Hàm định dạng số với dấu phẩy
function formatNumber(num, isCredit = false) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (isCredit) {
        return Math.round(num).toString();
    }
    return num.toFixed(1).replace('.', ',');
}

// Hàm lưu dữ liệu vào LocalStorage
function saveData() {
    try {
        // Tính lại điểm cuối kỳ cho tất cả môn học trước khi lưu
        data.forEach(sem => {
            if (sem.courses) {
                sem.courses.forEach(course => {
                    course.finalScore = calculateFinalScore(course);
                });
            }
        });

        localStorage.setItem('gpa_data', JSON.stringify(data));

        // Cập nhật UI ngay lập tức
        updateAllInfo();

    } catch (e) {
        console.error("Error saving data:", e);
    }
}

// Hàm tính điểm tổng kết môn học
function calculateFinalScore(course) {
    const qtWeight = course.w_qt / 100;
    const ckWeight = course.w_ck / 100;
    const final = (course.qt * qtWeight) + (course.ck * ckWeight);
    return Math.round(final * 100) / 100;
}

// Hàm tìm option phần trăm phù hợp
function findPercentageOption(qt, ck) {
    for (let i = 0; i < percentageOptions.length; i++) {
        if (Math.abs(percentageOptions[i].qt - qt) <= 1 &&
            Math.abs(percentageOptions[i].ck - ck) <= 1) {
            return i;
        }
    }
    return 1; // Mặc định 30-70
}

// Hàm cập nhật giá trị
function updateValue(semIdx, courseIdx, field, value) {
    if (!data[semIdx] || !data[semIdx].courses[courseIdx]) return;

    const c = data[semIdx].courses[courseIdx];

    if (field === 'name') {
        c.name = value;
    }
    else if (field === 'qt') {
        c.qt = validateScore(value);
    }
    else if (field === 'ck') {
        c.ck = validateScore(value);
    }
    else if (field === 'credit') {
        c.credit = validateCredit(value);
    }
    else if (field === 'w_qt') {
        const qt = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
        c.w_qt = qt;
        c.w_ck = 100 - qt;
    }

    c.finalScore = calculateFinalScore(c);
    saveData();

    // CẬP NHẬT TẤT CẢ
    updateCourseDisplay(semIdx, courseIdx);
    updateSemesterDisplay(semIdx);
    updateOverallInfo(); // THÊM DÒNG NÀY!
    updateSummary();     // CẬP NHẬT SUMMARY NỮA
}

// Hàm cập nhật hiển thị môn học
function updateCourseDisplay(semIdx, courseIdx) {
    if (!data[semIdx] || !data[semIdx].courses[courseIdx]) return;

    const course = data[semIdx].courses[courseIdx];
    const finalScore = calculateFinalScore(course);
    const validatedFinal = validateScore(finalScore);
    course.finalScore = validatedFinal;

    const finalScoreSpan = document.querySelector(`.final-score[data-sem-idx="${semIdx}"][data-course-idx="${courseIdx}"]`);
    const gradeLetterSpan = document.querySelector(`.grade-letter[data-sem-idx="${semIdx}"][data-course-idx="${courseIdx}"]`);
    const gpa4Span = document.querySelector(`.gpa-4[data-sem-idx="${semIdx}"][data-course-idx="${courseIdx}"]`);
    const gradeEvaluationSpan = document.querySelector(`.grade-evaluation[data-sem-idx="${semIdx}"][data-course-idx="${courseIdx}"]`);

    if (finalScoreSpan) finalScoreSpan.textContent = formatScoreWithComma(validatedFinal);

    if (gradeLetterSpan) {
        const gradeInfo = getGradeInfo(validatedFinal);
        gradeLetterSpan.textContent = gradeInfo.letter;
        gradeLetterSpan.className = `grade-letter ${getGradeColorClass(gradeInfo.letter)}`;
        gradeLetterSpan.title = `GPA 4.0: ${gradeInfo.gpa4}\nGPA 3.0: ${gradeInfo.gpa3}`;
    }

    if (gpa4Span) {
        const gradeInfo = getGradeInfo(validatedFinal);
        gpa4Span.textContent = formatGPAWithTwoDecimals(gradeInfo.gpa4);
    }

    if (gradeEvaluationSpan) {
        gradeEvaluationSpan.textContent = getAcademicEvaluation(validatedFinal);
    }
}

// Hàm cập nhật hiển thị học kỳ
function updateSemesterDisplay(semIdx) {
    if (!data[semIdx]) return;

    const semesterGPA = calculateGPA(data[semIdx].courses);
    const semesterAverage = calculateAverage(data[semIdx].courses);
    const semesterGPASpan = document.querySelector(`.semester-gpa[data-sem-idx="${semIdx}"]`);

    if (semesterGPASpan) {
        semesterGPASpan.textContent = `GPA: ${semesterGPA} | ĐTB: ${semesterAverage}`;

        semesterGPASpan.className = 'semester-gpa';
        const numericGPA = parseFloat(semesterGPA.replace(',', '.'));

        if (numericGPA >= 3.6) {
            semesterGPASpan.classList.add('gpa-excellent');
        } else if (numericGPA >= 3.2) {
            semesterGPASpan.classList.add('gpa-good');
        } else if (numericGPA >= 2.5) {
            semesterGPASpan.classList.add('gpa-average');
        } else if (numericGPA >= 2.0) {
            semesterGPASpan.classList.add('gpa-below-average');
        } else {
            semesterGPASpan.classList.add('gpa-poor');
        }
    }
}

// Hàm tính GPA của một học kỳ
function calculateGPA(courses) {
    if (!courses || courses.length === 0) return '0,00';

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    courses.forEach(c => {
        if (c.finalScore === undefined || isNaN(c.finalScore)) {
            c.finalScore = calculateFinalScore(c);
        }

        const validatedFinal = validateScore(c.finalScore);
        const gradeInfo = getGradeInfo(validatedFinal);
        const gradePoint = gradeInfo.gpa4;
        const credit = validateCredit(c.credit);

        totalWeightedPoints += gradePoint * credit;
        totalCredits += credit;
    });

    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    return formatGPAWithTwoDecimals(gpa);
}

// Hàm tính ĐIỂM TRUNG BÌNH của một học kỳ
function calculateAverage(courses) {
    if (!courses || courses.length === 0) return '0,0';

    let totalWeightedScore = 0;
    let totalCredits = 0;

    courses.forEach(c => {
        if (c.finalScore === undefined || isNaN(c.finalScore)) {
            c.finalScore = calculateFinalScore(c);
        }

        const validatedFinal = validateScore(c.finalScore);
        const credit = validateCredit(c.credit);

        totalWeightedScore += validatedFinal * credit;
        totalCredits += credit;
    });

    return totalCredits > 0 ? formatScoreWithComma(totalWeightedScore / totalCredits) : '0,0';
}

// Hàm tính ĐIỂM TRUNG BÌNH tổng thể
function calculateOverallScore() {
    if (data.length === 0) return '0,0';

    let totalWeightedScore = 0;
    let totalCredits = 0;

    data.forEach(sem => {
        sem.courses.forEach(c => {
            if (c.finalScore === undefined || isNaN(c.finalScore)) {
                c.finalScore = calculateFinalScore(c);
            }

            const validatedFinal = validateScore(c.finalScore);
            const credit = validateCredit(c.credit);

            totalWeightedScore += validatedFinal * credit;
            totalCredits += credit;
        });
    });

    const score = totalCredits > 0 ? totalWeightedScore / totalCredits : 0;
    return formatScoreWithComma(score);
}

// Hàm tính GPA tổng thể
function calculateOverallGPA() {
    if (data.length === 0) return '0,00';

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    data.forEach(sem => {
        sem.courses.forEach(c => {
            if (!c.finalScore || isNaN(c.finalScore)) {
                c.finalScore = calculateFinalScore(c);
            }

            const validatedFinal = validateScore(c.finalScore);
            const gradeInfo = getGradeInfo(validatedFinal);
            const gradePoint = gradeInfo.gpa4;
            const credit = validateCredit(c.credit);

            totalWeightedPoints += gradePoint * credit;
            totalCredits += credit;
        });
    });

    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    return formatGPAWithTwoDecimals(gpa);
}

// HÀM THÊM HỌC KỲ MỚI
function addSemester() {
    const semNumber = data.length + 1;
    data.push({
        id: Date.now(),
        name: `Học kỳ ${semNumber}`,
        courses: []
    });
    saveData();
    render();
}

// HÀM THÊM MÔN HỌC VÀO HỌC KỲ
function addCourse(semIdx) {
    if (!data[semIdx]) return;

    if (!data[semIdx].courses) {
        data[semIdx].courses = [];
    }

    data[semIdx].courses.push({
        name: 'Môn học mới',
        credit: 3,
        qt: 0,
        w_qt: 30,
        ck: 0,
        w_ck: 70,
        finalScore: 0
    });

    saveData();
    render();
}
// Hàm cập nhật tất cả thông tin
function updateAllInfo() {
    // Cập nhật từng môn học
    data.forEach((sem, semIdx) => {
        sem.courses.forEach((course, courseIdx) => {
            course.finalScore = calculateFinalScore(course);
            updateCourseDisplay(semIdx, courseIdx);
        });
        updateSemesterDisplay(semIdx);
    });

    // Cập nhật tổng thể
    updateOverallInfo();
    updateSummary();
}
// Hàm cập nhật tỷ lệ phần trăm
function updatePercentage(semIdx, courseIdx, selectElement) {
    if (!data[semIdx] || !data[semIdx].courses[courseIdx]) return;

    const course = data[semIdx].courses[courseIdx];
    const selectedOption = percentageOptions[selectElement.selectedIndex];

    course.w_qt = selectedOption.qt;
    course.w_ck = selectedOption.ck;

    saveData();

    // CẬP NHẬT TẤT CẢ
    updateCourseDisplay(semIdx, courseIdx);
    updateSemesterDisplay(semIdx);
    updateOverallInfo(); // THÊM DÒNG NÀY!
}

// Hàm cập nhật tên học kỳ
function updateSemesterName(semIdx, value) {
    if (data[semIdx]) {
        data[semIdx].name = value;
        saveData();
    }
}

// Hàm cập nhật thông tin tổng thể
function updateOverallInfo() {
    const overallGPA = calculateOverallGPA();
    const overallScore = calculateOverallScore();

    const overallGPAElem = document.getElementById('overall-gpa');
    const overallScoreElem = document.getElementById('overall-score');

    if (overallGPAElem) {
        overallGPAElem.textContent = overallGPA;

        overallGPAElem.className = '';
        const numericGPA = parseFloat(overallGPA.replace(',', '.'));

        if (numericGPA >= 3.6) {
            overallGPAElem.classList.add('gpa-excellent');
        } else if (numericGPA >= 3.2) {
            overallGPAElem.classList.add('gpa-good');
        } else if (numericGPA >= 2.5) {
            overallGPAElem.classList.add('gpa-average');
        } else if (numericGPA >= 2.0) {
            overallGPAElem.classList.add('gpa-below-average');
        } else {
            overallGPAElem.classList.add('gpa-poor');
        }
    }

    if (overallScoreElem) {
        overallScoreElem.textContent = overallScore;
    }
}

// Hàm xóa học kỳ
function deleteSemester(semIdx) {
    const confirmDiv = document.getElementById(`delete-confirm-${semIdx}`);
    if (confirmDiv && confirmDiv.style.display === 'block') {
        data.splice(semIdx, 1);
        saveData();
        render();
    } else if (confirmDiv) {
        confirmDiv.style.display = 'block';
    }
}

// Hàm hủy xóa học kỳ
function cancelDelete(semIdx) {
    const confirmDiv = document.getElementById(`delete-confirm-${semIdx}`);
    if (confirmDiv) {
        confirmDiv.style.display = 'none';
    }
}

// Hàm xóa một môn học
function deleteCourse(semIdx, courseIdx) {
    if (!data[semIdx] || !data[semIdx].courses[courseIdx]) return;

    data[semIdx].courses.splice(courseIdx, 1);
    saveData();
    render();
}

// Hàm cập nhật bảng tổng quan
function updateSummary() {
    let totalCourses = 0;
    let totalCredits = 0;

    data.forEach(sem => {
        if (sem.courses && Array.isArray(sem.courses)) {
            totalCourses += sem.courses.length;
            sem.courses.forEach(c => {
                totalCredits += validateCredit(c.credit);
            });
        }
    });

    const totalSemestersElem = document.getElementById('total-semesters');
    const totalCoursesElem = document.getElementById('total-courses');
    const totalCreditsElem = document.getElementById('total-credits');

    if (totalSemestersElem) totalSemestersElem.textContent = data.length;
    if (totalCoursesElem) totalCoursesElem.textContent = totalCourses;
    if (totalCreditsElem) totalCreditsElem.textContent = formatNumber(totalCredits, true);

    updateOverallInfo();
    
    // Render the currently active chart tab
    if (typeof renderChart === 'function') {
        if (activeChartTab === 'dist') {
            renderDistChart();
        } else {
            renderChart();
        }
    }
    
    // Evaluate and render achievement badges
    if (typeof evaluateBadges === 'function') {
        evaluateBadges();
    }
}

// HÀM RENDER QUAN TRỌNG - ĐÃ FIX ĐẦY ĐỦ
function render() {
    const container = document.getElementById('semesters-container');

    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `
            <div class="semester-card" style="text-align: center; padding: 40px;">
                <h3 style="color: var(--gray); margin-bottom: 20px;">Chưa có dữ liệu học kỳ</h3>
                <p style="margin-bottom: 25px;">Bắt đầu bằng cách thêm học kỳ đầu tiên hoặc tải dữ liệu từ file CSV.</p>
                <button class="btn btn-primary" onclick="addSemester()" style="margin-right: 10px;">
                    <span class="btn-icon">+</span> Thêm học kỳ đầu tiên
                </button>
                <button class="btn btn-success" onclick="importCSVData()">
                    <span class="btn-icon">📥</span> Tải dữ liệu từ file CSV
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map((sem, semIdx) => {
        const semesterGPA = calculateGPA(sem.courses);
        const semesterAverage = calculateAverage(sem.courses);
        let gpaClass = '';

        const numericGPA = parseFloat(semesterGPA.replace(',', '.'));
        if (numericGPA >= 3.6) {
            gpaClass = 'gpa-excellent';
        } else if (numericGPA >= 3.2) {
            gpaClass = 'gpa-good';
        } else if (numericGPA >= 2.5) {
            gpaClass = 'gpa-average';
        } else if (numericGPA >= 2.0) {
            gpaClass = 'gpa-below-average';
        } else {
            gpaClass = 'gpa-poor';
        }

        return `
            <div class="semester-card">
                <div class="semester-header">
                    <div class="semester-title">
                        <span>📚</span>
                        <input id="sem-name-${semIdx}" value="${sem.name}" 
                               oninput="updateSemesterName(${semIdx}, this.value)"
                               placeholder="Tên học kỳ">
                    </div>
                    <div class="semester-actions">
                        <span class="semester-gpa ${gpaClass}" data-sem-idx="${semIdx}">
                            GPA: ${semesterGPA} | ĐTB: ${semesterAverage}
                        </span>
                        <button class="btn btn-success btn-sm" onclick="addCourse(${semIdx})">
                            <span class="btn-icon">+</span> Môn học
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSemester(${semIdx})">
                            <span class="btn-icon">🗑️</span> Xóa
                        </button>
                    </div>
                </div>
                
                <div class="delete-confirm" id="delete-confirm-${semIdx}" style="display: none;">
                    <p style="margin-bottom: 10px;">Bạn có chắc muốn xóa học kỳ này? Thao tác này không thể hoàn tác.</p>
                    <button class="btn btn-danger btn-sm" onclick="deleteSemester(${semIdx})">Xác nhận xóa</button>
                    <button class="btn btn-light btn-sm" onclick="cancelDelete(${semIdx})">Hủy</button>
                </div>
                
                ${sem.courses && sem.courses.length > 0 ? `
                    <table class="courses-table">
                        <thead>
                            <tr>
                                <th style="width: 18%;">Tên môn học</th>
                                <th style="width: 7%;">TC</th>
                                <th style="width: 7%;">QT</th>
                                <th style="width: 7%;">CK</th>
                                <th style="width: 16%;">Tỷ lệ</th>
                                <th style="width: 8%;">Điểm số</th>
                                <th style="width: 8%;">Điểm chữ</th>
                                <th style="width: 6%;">GPA</th>
                                <th style="width: 12%;">Đánh giá</th>
                                <th style="width: 5%;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sem.courses.map((course, courseIdx) => {
            const finalScore = calculateFinalScore(course);
            const validatedFinal = validateScore(finalScore);
            const gradeInfo = getGradeInfo(validatedFinal);
            const evaluation = getAcademicEvaluation(validatedFinal);
            const selectedPercentIndex = findPercentageOption(course.w_qt, course.w_ck);

            return `
                                    <tr>
                                        <td>
                                            <input class="course-input" id="course-name-${semIdx}-${courseIdx}" 
                                                   value="${course.name}" 
                                                   oninput="updateValue(${semIdx}, ${courseIdx}, 'name', this.value)">
                                        </td>
                                        <td>
                                            <input class="course-input" id="course-credit-${semIdx}-${courseIdx}" 
                                                   type="number" min="1" step="1" max="10"
                                                   value="${Math.round(course.credit)}" 
                                                   oninput="updateValue(${semIdx}, ${courseIdx}, 'credit', this.value)">
                                        </td>
                                        <td>
                                            <input class="course-input score-input" 
                                                   id="course-qt-${semIdx}-${courseIdx}" 
                                                   value="${formatScoreWithComma(course.qt)}" 
                                                   oninput="handleScoreInput(this, ${semIdx}, ${courseIdx}, 'qt')"
                                                   onkeydown="handleScoreKeydown(event, this, ${semIdx}, ${courseIdx}, 'qt')"  onchange="updateOverallInfo()"
                                                   placeholder="0,0">
                                        </td>
                                        <td>
                                            <input class="course-input score-input" 
                                                   id="course-ck-${semIdx}-${courseIdx}" 
                                                   value="${formatScoreWithComma(course.ck)}" 
                                                   oninput="handleScoreInput(this, ${semIdx}, ${courseIdx}, 'ck')"
                                                   onkeydown="handleScoreKeydown(event, this, ${semIdx}, ${courseIdx}, 'ck')"  onchange="updateOverallInfo()"
                                                   placeholder="0,0">
                                        </td>
                                        <td>
                                            <select class="course-input" id="course-percentage-${semIdx}-${courseIdx}" 
                                                    onchange="updatePercentage(${semIdx}, ${courseIdx}, this)">
                                                ${percentageOptions.map((option, index) => `
                                                    <option value="${index}" ${selectedPercentIndex === index ? 'selected' : ''}>
                                                        ${option.label}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </td>
                                        <td>
                                            <span class="final-score" data-sem-idx="${semIdx}" data-course-idx="${courseIdx}" 
                                                  style="font-weight: 600;">${formatScoreWithComma(validatedFinal)}</span>
                                        </td>
                                        <td>
                                            <span class="grade-letter ${getGradeColorClass(gradeInfo.letter)}" 
                                                  data-sem-idx="${semIdx}" data-course-idx="${courseIdx}"
                                                  title="GPA 4.0: ${formatGPAWithTwoDecimals(gradeInfo.gpa4)}\nGPA 3.0: ${formatGPAWithTwoDecimals(gradeInfo.gpa3)}">
                                                ${gradeInfo.letter}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="gpa-4" data-sem-idx="${semIdx}" data-course-idx="${courseIdx}"
                                                  style="font-weight: 600;">
                                                ${formatGPAWithTwoDecimals(gradeInfo.gpa4)}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="grade-evaluation" data-sem-idx="${semIdx}" data-course-idx="${courseIdx}">
                                                ${evaluation}
                                            </span>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-danger btn-sm" 
                                                    onclick="deleteCourse(${semIdx}, ${courseIdx})">
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div style="text-align: center; padding: 20px; color: var(--gray);">
                        Chưa có môn học nào. Hãy thêm môn học đầu tiên!
                    </div>
                `}
                
                <div style="text-align: center; margin-top: 15px;">
                    <button type="button" class="btn btn-primary" onclick="addCourse(${semIdx})">
                        <span class="btn-icon">+</span> Thêm môn học
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Thêm các hàm còn lại từ file gốc (giữ nguyên)
function importCSVData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    fileInput.onchange = importDataFromCSV;

    document.body.appendChild(fileInput);
    fileInput.click();

    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 100);
}

function importDataFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        alert("Vui lòng chọn file CSV!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n');
            const new_data = [];
            let currentSem = null;

            // Bỏ qua dòng header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Parse CSV đơn giản (tách bằng dấu phẩy, bỏ qua ngoặc kép)
                const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const semName = parts[0] ? parts[0].replace(/^"|"$/g, '') : "Học kỳ 1";
                const courseName = parts[1] ? parts[1].replace(/^"|"$/g, '') : "Môn học";
                const credit = parseFloat(parts[2]) || 3;
                const qt = parseFloat(parts[3]) || 0;
                const w_qt = parseFloat(parts[4]) || 30;
                const ck = parseFloat(parts[5]) || 0;
                const w_ck = parseFloat(parts[6]) || 70;

                if (!currentSem || currentSem.name !== semName) {
                    currentSem = {
                        id: Date.now() + i,
                        name: semName,
                        courses: []
                    };
                    new_data.push(currentSem);
                }

                currentSem.courses.push({
                    name: courseName,
                    credit: credit,
                    qt: qt,
                    w_qt: w_qt,
                    ck: ck,
                    w_ck: w_ck,
                    finalScore: 0
                });
            }

            if (data.length > 0) {
                if (!confirm("Thao tác này sẽ thay thế dữ liệu hiện tại. Bạn có chắc không?")) return;
            }

            data = new_data;
            data.forEach(sem => {
                if (sem.courses) sem.courses.forEach(c => c.finalScore = calculateFinalScore(c));
            });

            saveData();
            render();
            alert("Đã tải dữ liệu thành công!");
        } catch (error) {
            alert("Lỗi khi đọc file CSV: " + error.message);
        }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = '';
}

function exportData() {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Học kỳ,Tên môn học,Tín chỉ,Điểm QT,Trọng số QT(%),Điểm CK,Trọng số CK(%),Điểm Tổng Kết\n";

    data.forEach(sem => {
        sem.courses.forEach(course => {
            const row = [
                `"${sem.name}"`,
                `"${course.name}"`,
                course.credit,
                course.qt,
                course.w_qt,
                course.ck,
                course.w_ck,
                course.finalScore
            ];
            csvContent += row.join(",") + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HUIT-GPA-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllData() {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu? Thao tác này không thể hoàn tác.")) {
        data = [];
        saveData();
        render();
    }
}

// Khởi chạy lần đầu
document.addEventListener('DOMContentLoaded', function () {
    render();
    updateSummary();

    // Kiểm tra xem có dữ liệu hay chưa, nếu chưa có (lần đầu hoặc đã xóa hết) thì hiện Welcome Modal
    if (data.length === 0) {
        const welcomeModal = document.getElementById('welcome-modal');
        if (welcomeModal) {
            welcomeModal.style.display = 'block';
        }
    }
});

// --- Modal Welcome Functions ---
function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchToImportModal() {
    closeWelcomeModal();
    openImportModal();
}

// --- Modal Import Functions ---
let apiContext = {
    token: '',
    ncforminfo: '',
    cookies: []
};
let useRealAPI = false;

function openImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('captcha-img').src = 'https://dummyimage.com/120x42/eee/999.png&text=Loading...';
        refreshCaptcha();
    }
}

function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('import-mssv').value = '';
        document.getElementById('import-name').value = '';
        document.getElementById('import-dob').value = '';
        document.getElementById('import-class').value = '';
        document.getElementById('import-idcard').value = '';
        document.getElementById('import-captcha').value = '';
        document.getElementById('import-error-message').style.display = 'none';
        
        // Reset view state
        document.getElementById('import-form-container').style.display = 'block';
        document.getElementById('import-loading-container').style.display = 'none';
    }
}

async function refreshCaptcha() {
    const img = document.getElementById('captcha-img');
    if (!img) return;

    try {
        const initRes = await fetch('/api/init');
        if (!initRes.ok) throw new Error("Network error");

        const initData = await initRes.json();
        if (initData.success) {
            apiContext.token = initData.token;
            apiContext.ncforminfo = initData.ncforminfo;
            apiContext.cookies = initData.cookies;

            const captchaRes = await fetch('/api/captcha?cookies=' + encodeURIComponent(apiContext.cookies.join(';')));
            const captchaData = await captchaRes.json();

            if (captchaData.success) {
                img.src = captchaData.image;
                useRealAPI = true;
                return;
            }
        }
    } catch (e) {
        console.error('Lỗi khi tải Captcha:', e);
        img.src = '';
        img.alt = 'Chưa thể tải Captcha, vui lòng deploy API';
        useRealAPI = false;
    }
}

async function submitImport() {
    const mssv = document.getElementById('import-mssv').value.trim();
    const name = document.getElementById('import-name').value.trim();
    const dob = document.getElementById('import-dob').value.trim();
    const classId = document.getElementById('import-class').value.trim();
    const idCard = document.getElementById('import-idcard').value.trim();
    const captchaInput = document.getElementById('import-captcha').value.trim();
    const errorMsg = document.getElementById('import-error-message');

    if (!mssv || !name || !dob || !classId || !idCard || !captchaInput) {
        errorMsg.textContent = "Vui lòng nhập đầy đủ tất cả thông tin!";
        errorMsg.style.display = 'block';
        return;
    }
    
    errorMsg.style.display = 'none';

    // Đổi giao diện sang trạng thái Loading
    const formContainer = document.getElementById('import-form-container');
    const loadingContainer = document.getElementById('import-loading-container');
    const statusText = document.getElementById('import-loading-status');
    const progressBar = document.getElementById('import-progress-bar');
    
    formContainer.style.display = 'none';
    loadingContainer.style.display = 'block';
    
    statusText.textContent = "Đang xác thực thông tin sinh viên...";
    progressBar.style.width = '20%';

    if (useRealAPI) {
        try {
            const lookupRes = await fetch('/api/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: mssv,
                    studentName: name,
                    dob: dob,
                    classId: classId,
                    idCard: idCard,
                    captcha: captchaInput,
                    token: apiContext.token,
                    ncforminfo: apiContext.ncforminfo,
                    cookies: apiContext.cookies
                })
            });
            const lookupData = await lookupRes.json();

            if (!lookupData.success) {
                errorMsg.textContent = lookupData.error || "Thông tin không chính xác. Vui lòng kiểm tra lại.";
                errorMsg.style.display = 'block';
                formContainer.style.display = 'block';
                loadingContainer.style.display = 'none';
                refreshCaptcha();
                return;
            }

            statusText.textContent = "Đang tải bảng điểm từ hệ thống HUIT...";
            progressBar.style.width = '60%';

            const gradesRes = await fetch('/api/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: lookupData.url,
                    cookies: apiContext.cookies
                })
            });

            const gradesData = await gradesRes.json();
            if (gradesData.success) {
                statusText.textContent = "Đang bóc tách dữ liệu...";
                progressBar.style.width = '90%';
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(gradesData.html, 'text/html');
                
                const table = doc.getElementById('xemDiem');
                if (!table) {
                    errorMsg.textContent = "Lỗi: Không tìm thấy bảng điểm trong dữ liệu trả về từ HUIT.";
                    errorMsg.style.display = 'block';
                    formContainer.style.display = 'block';
                    loadingContainer.style.display = 'none';
                    return;
                }

                const trs = table.querySelectorAll('tr'); // Bỏ tbody đi để chắc chắn lấy được tr
                let newSemesters = [];
                let currentSem = null;

                trs.forEach(tr => {
                    const tds = tr.querySelectorAll('td, th');
                    const text = tr.textContent.trim();
                    
                    // Phát hiện chính xác dòng bắt đầu bằng HK hoặc Học kỳ (Ví dụ: "HK1 (2024 - 2025)")
                    const isSemesterMatch = /^HK\s*\d+/i.test(text) || /^Học kỳ/i.test(text);
                    
                    const isSemesterRow = tr.classList.contains('row-head') || 
                                          tr.classList.contains('title-hk-diem') || 
                                          tr.classList.contains('title-hk') ||
                                          isSemesterMatch; // Nếu text bắt đầu bằng Học kỳ hoặc HK thì chắc chắn là dòng học kỳ

                    if (isSemesterRow) {
                        currentSem = {
                            id: Date.now() + Math.random(),
                            name: text,
                            courses: []
                        };
                        newSemesters.push(currentSem);
                    } 
                    // Dòng chứa môn học (có từ 5 cột trở lên)
                    else if (currentSem && tds.length >= 5) {
                        const nameTd = tr.querySelector('td:nth-child(3)');
                        const creditTd = tr.querySelector('td:nth-child(4)');
                        
                        // Lấy td bằng title (Chuẩn PSC UIS)
                        const qtTd = tr.querySelector('td[title="DiemTBThuongKy"]') || tr.querySelector('td[title="Điểm quá trình"]');
                        const ckTd = tr.querySelector('td[title="DiemThi"]') || tr.querySelector('td[title="Điểm thi"]');
                        const finalTd = tr.querySelector('td[title="DiemTongKet"]') || tr.querySelector('td[title="Điểm tổng kết"]');

                        if (!nameTd || !creditTd) return;

                        const courseName = nameTd.textContent.trim();
                        const creditStr = creditTd.textContent.trim();
                        const credit = parseInt(creditStr);
                        
                        // Loại bỏ môn Thể chất, Giáo dục Quốc phòng, các dòng tính tổng hoặc tín chỉ 0
                        const lowerName = courseName.toLowerCase();
                        if (isNaN(credit) || credit === 0 || 
                            lowerName.includes("điểm trung bình") ||
                            lowerName.includes("thể chất") ||
                            lowerName.includes("quốc phòng")) return;

                        let qt = 0, ck = 0, final = 0;
                        let hasQt = qtTd && qtTd.textContent.trim() !== '';
                        let hasCk = ckTd && ckTd.textContent.trim() !== '';
                        let hasFinal = finalTd && finalTd.textContent.trim() !== '';
                        
                        if (hasQt) qt = parseFloat(qtTd.textContent.trim().replace(',', '.')) || 0;
                        if (hasCk) ck = parseFloat(ckTd.textContent.trim().replace(',', '.')) || 0;
                        if (hasFinal) final = parseFloat(finalTd.textContent.trim().replace(',', '.')) || 0;

                        // Tìm trọng số (w_qt, w_ck) phù hợp nhất với DiemTongKet của trường
                        let bestWQt = 30; // Mặc định 30% QT, 70% CK
                        
                        // Nếu là môn thực hành (chỉ có điểm thi/cuối kỳ)
                        if (!hasQt && hasCk) {
                            bestWQt = 0; // 0% quá trình, 100% cuối kỳ
                            qt = ck;     // Hiển thị tạm điểm thi sang quá trình để UI không bị rối, hoặc để 0
                        }
                        // Nếu chỉ có điểm quá trình
                        else if (hasQt && !hasCk) {
                            bestWQt = 100; // 100% quá trình, 0% cuối kỳ
                            ck = qt;
                        } 
                        else {
                            let minDiff = 999;
                            // Thử các trọng số QT phổ biến: 10, 20, 30, 40, 50
                            [10, 20, 30, 40, 50].forEach(testW => {
                                const calculatedFinal = (qt * testW + ck * (100 - testW)) / 100;
                                const diff = Math.abs(Math.round(calculatedFinal * 10) / 10 - final);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    bestWQt = testW;
                                }
                            });
                        }

                        currentSem.courses.push({
                            name: courseName,
                            credit: credit,
                            qt: qt,
                            w_qt: bestWQt,
                            ck: ck,
                            w_ck: 100 - bestWQt,
                            finalScore: final
                        });
                    }
                });

                if (newSemesters.length > 0) {
                    progressBar.style.width = '100%';
                    data = newSemesters;
                    saveData();
                    render();
                    
                    setTimeout(() => {
                        alert(`Tải thành công ${newSemesters.length} học kỳ!`);
                        closeImportModal();
                    }, 300);
                } else {
                    errorMsg.textContent = "Không tìm thấy dữ liệu học kỳ/môn học nào hợp lệ trong bảng điểm.";
                    errorMsg.style.display = 'block';
                    formContainer.style.display = 'block';
                    loadingContainer.style.display = 'none';
                }
            } else {
                throw new Error("Không thể tải bảng điểm");
            }
        } catch (e) {
            console.error(e);
            errorMsg.textContent = "Lỗi kết nối. Vui lòng thử lại sau.";
            errorMsg.style.display = 'block';
            formContainer.style.display = 'block';
            loadingContainer.style.display = 'none';
        }
    } else {
        errorMsg.textContent = "Hệ thống đang chạy offline, không thể tra cứu tự động.";
        errorMsg.style.display = 'block';
        formContainer.style.display = 'block';
        loadingContainer.style.display = 'none';
    }
}

// Đóng modal khi click ra ngoài
window.onclick = function (event) {
    const importModal = document.getElementById('import-modal');
    const welcomeModal = document.getElementById('welcome-modal');
    if (event.target == importModal) {
        closeImportModal();
    }
    if (event.target == welcomeModal) {
        closeWelcomeModal();
    }
}

// ============================================================
// SECTION: CHARTS (GPA Trend + Grade Distribution)
// ============================================================
let gpaChart = null;
let distChart = null;
let activeChartTab = 'trend';

// Helper: tính GPA hệ 4 từ điểm 10
function calculateGpaScale4(score) {
    const info = getGradeInfo(validateScore(score));
    return info.gpa4;
}

function switchChartTab(tab) {
    activeChartTab = tab;
    const trendBtn = document.getElementById('tab-trend');
    const distBtn = document.getElementById('tab-dist');
    const trendWrap = document.getElementById('chart-trend-wrapper');
    const distWrap = document.getElementById('chart-dist-wrapper');
    if (!trendBtn) return;

    if (tab === 'trend') {
        trendBtn.classList.add('chart-tab-active');
        distBtn.classList.remove('chart-tab-active');
        trendWrap.style.display = '';
        distWrap.style.display = 'none';
        renderChart();
    } else {
        distBtn.classList.add('chart-tab-active');
        trendBtn.classList.remove('chart-tab-active');
        trendWrap.style.display = 'none';
        distWrap.style.display = '';
        renderDistChart();
    }
}

function renderChart() {
    const ctx = document.getElementById('gpaTrendChart');
    if (!ctx) return;
    if (!data || data.length === 0 || typeof Chart === 'undefined') {
        if (gpaChart) { gpaChart.destroy(); gpaChart = null; }
        return;
    }

    const labels = data.map(sem => sem.name);
    const gpaData = data.map(sem => {
        let totalPts = 0, totalCr = 0;
        sem.courses.forEach(c => {
            const cr = validateCredit(c.credit);
            totalPts += calculateGpaScale4(c.finalScore) * cr;
            totalCr += cr;
        });
        return totalCr > 0 ? parseFloat((totalPts / totalCr).toFixed(2)) : 0;
    });

    if (gpaChart) { gpaChart.destroy(); }

    gpaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'GPA Học Kỳ',
                    data: gpaData,
                    borderColor: '#8338ec',
                    backgroundColor: 'rgba(131,56,236,0.10)',
                    borderWidth: 3,
                    pointBackgroundColor: gpaData.map(v => v >= 3.6 ? '#f8961e' : v >= 3.2 ? '#4cc9f0' : v >= 2.5 ? '#4361ee' : '#f72585'),
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.35
                },
                {
                    label: 'Ngưỡng Giỏi (3.2)',
                    data: labels.map(() => 3.2),
                    borderColor: 'rgba(76,201,240,0.5)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 4, ticks: { stepSize: 0.5 }, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `GPA: ${ctx.parsed.y}`
                    }
                }
            }
        }
    });
}

function renderDistChart() {
    const ctx = document.getElementById('gradeDistChart');
    if (!ctx) return;

    // Tính phân bổ tín chỉ theo nhóm điểm chữ
    const groups = { A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, 'D+': 0, D: 0, F: 0 };
    data.forEach(sem => sem.courses.forEach(c => {
        const letter = getGradeInfo(validateScore(c.finalScore)).letter;
        groups[letter] = (groups[letter] || 0) + validateCredit(c.credit);
    }));

    // Gộp thành 5 nhóm lớn: A, B(B+B), C(C+C), D(D+D), F
    const merged = {
        'A (≥8.5)': groups['A'],
        'B (7.0-8.4)': (groups['B+'] || 0) + (groups['B'] || 0),
        'C (5.5-6.9)': (groups['C+'] || 0) + (groups['C'] || 0),
        'D (4.0-5.4)': (groups['D+'] || 0) + (groups['D'] || 0),
        'F (<4.0)': groups['F'] || 0
    };

    const labels = Object.keys(merged);
    const values = Object.values(merged);
    const colors = ['#27ae60', '#4361ee', '#f8961e', '#f4a261', '#f72585'];

    if (distChart) { distChart.destroy(); }

    distChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { size: 11 }, padding: 10, boxWidth: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed} TC`
                    }
                }
            }
        }
    });
}

// ============================================================
// SECTION: GAMIFICATION — BADGES
// ============================================================
const BADGE_DEFINITIONS = [
    {
        id: 'excellent_overall',
        emoji: '🏆',
        name: 'Xuất sắc toàn khóa',
        desc: 'GPA tổng ≥ 3.6',
        check: () => {
            const gpa = parseFloat(calculateOverallGPA().replace(',', '.'));
            return gpa >= 3.6;
        }
    },
    {
        id: 'good_student',
        emoji: '🥇',
        name: 'Sinh viên Giỏi',
        desc: 'GPA tổng ≥ 3.2',
        check: () => {
            const gpa = parseFloat(calculateOverallGPA().replace(',', '.'));
            return gpa >= 3.2;
        }
    },
    {
        id: 'improving_3sem',
        emoji: '📈',
        name: 'Tiến bộ liên tục',
        desc: 'GPA tăng 3 HK liên tiếp',
        check: () => {
            if (data.length < 3) return false;
            const gpas = data.map(sem => {
                let tp = 0, tc = 0;
                sem.courses.forEach(c => { tp += calculateGpaScale4(c.finalScore) * validateCredit(c.credit); tc += validateCredit(c.credit); });
                return tc > 0 ? tp / tc : 0;
            });
            for (let i = gpas.length - 1; i >= 2; i--) {
                if (gpas[i] > gpas[i-1] && gpas[i-1] > gpas[i-2]) return true;
            }
            return false;
        }
    },
    {
        id: 'blazing_semester',
        emoji: '🔥',
        name: 'HK bùng cháy',
        desc: 'Có ≥1 học kỳ GPA ≥ 3.6',
        check: () => data.some(sem => {
            let tp = 0, tc = 0;
            sem.courses.forEach(c => { tp += calculateGpaScale4(c.finalScore) * validateCredit(c.credit); tc += validateCredit(c.credit); });
            return tc > 0 && tp / tc >= 3.6;
        })
    },
    {
        id: 'no_f',
        emoji: '💎',
        name: 'Không có môn F',
        desc: 'Không môn nào < 4 điểm',
        check: () => data.every(sem => sem.courses.every(c => validateScore(c.finalScore) >= 4.0))
            && data.some(sem => sem.courses.length > 0)
    },
    {
        id: 'credit_100',
        emoji: '🎯',
        name: 'Chinh phục 100 TC',
        desc: 'Tổng tín chỉ tích lũy ≥ 100',
        check: () => {
            let total = 0;
            data.forEach(sem => sem.courses.forEach(c => { total += validateCredit(c.credit); }));
            return total >= 100;
        }
    },
    {
        id: 'consistent',
        emoji: '⚡',
        name: 'Nhất quán',
        desc: 'Tất cả học kỳ GPA ≥ 2.5',
        check: () => data.length > 0 && data.every(sem => {
            if (sem.courses.length === 0) return true;
            let tp = 0, tc = 0;
            sem.courses.forEach(c => { tp += calculateGpaScale4(c.finalScore) * validateCredit(c.credit); tc += validateCredit(c.credit); });
            return tc > 0 && tp / tc >= 2.5;
        })
    },
    {
        id: 'perfect_score',
        emoji: '🌟',
        name: 'Đạt đỉnh',
        desc: 'Có ≥1 môn điểm 10',
        check: () => data.some(sem => sem.courses.some(c => validateScore(c.finalScore) === 10))
    }
];

function evaluateBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    container.innerHTML = BADGE_DEFINITIONS.map(badge => {
        const earned = data.length > 0 && badge.check();
        return `<div class="badge-item ${earned ? 'badge-earned' : 'badge-locked'}" title="${badge.desc}">
            <span class="badge-emoji">${badge.emoji}</span>
            <span class="badge-name">${badge.name}</span>
        </div>`;
    }).join('');
}

// ============================================================
// SECTION: WHAT-IF GPA SIMULATOR
// ============================================================
let whatIfData = []; // [{name, credit, score}]
let whatIfOpen = false;

function toggleWhatIf() {
    whatIfOpen = !whatIfOpen;
    const body = document.getElementById('whatif-body');
    const icon = document.getElementById('whatif-toggle-icon');
    if (!body) return;
    body.style.display = whatIfOpen ? 'block' : 'none';
    if (icon) icon.textContent = whatIfOpen ? '▲' : '▼';
    if (whatIfOpen && whatIfData.length === 0) addWhatIfRow();
}

function addWhatIfRow() {
    const idx = whatIfData.length;
    whatIfData.push({ name: '', credit: 3, score: 7 });
    renderWhatIfTable();
}

function removeWhatIfRow(idx) {
    whatIfData.splice(idx, 1);
    renderWhatIfTable();
    calculateWhatIfGPA();
}

function renderWhatIfTable() {
    const tbody = document.getElementById('whatif-rows');
    if (!tbody) return;

    tbody.innerHTML = whatIfData.map((row, idx) => `
        <tr>
            <td><input type="text" value="${row.name}" placeholder="Tên môn..." oninput="whatIfData[${idx}].name=this.value"></td>
            <td><input type="number" value="${row.credit}" min="1" max="10" style="width:55px;" oninput="whatIfData[${idx}].credit=parseInt(this.value)||3; calculateWhatIfGPA();"></td>
            <td><input type="number" value="${row.score}" min="0" max="10" step="0.5" style="width:65px;" oninput="whatIfData[${idx}].score=parseFloat(this.value)||0; calculateWhatIfGPA();"></td>
            <td><button onclick="removeWhatIfRow(${idx})" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:1rem;">✕</button></td>
        </tr>
    `).join('');

    calculateWhatIfGPA();
}

function clearWhatIf() {
    whatIfData = [];
    renderWhatIfTable();
    const result = document.getElementById('whatif-result');
    if (result) result.style.display = 'none';
}

function calculateWhatIfGPA() {
    const result = document.getElementById('whatif-result');
    if (!result) return;

    const validRows = whatIfData.filter(r => r.credit > 0);
    if (validRows.length === 0) {
        result.style.display = 'none';
        return;
    }

    // GPA thực tế hiện tại
    let realPts = 0, realCr = 0;
    data.forEach(sem => sem.courses.forEach(c => {
        const cr = validateCredit(c.credit);
        realPts += calculateGpaScale4(c.finalScore) * cr;
        realCr += cr;
    }));
    const currentGPA = realCr > 0 ? realPts / realCr : 0;

    // GPA dự kiến
    let projPts = realPts, projCr = realCr;
    validRows.forEach(r => {
        const cr = parseInt(r.credit) || 3;
        const gp4 = calculateGpaScale4(parseFloat(r.score) || 0);
        projPts += gp4 * cr;
        projCr += cr;
    });
    const projGPA = projCr > 0 ? projPts / projCr : 0;
    const delta = projGPA - currentGPA;

    document.getElementById('wi-current-gpa').textContent = currentGPA.toFixed(2);
    const projElem = document.getElementById('wi-projected-gpa');
    projElem.textContent = projGPA.toFixed(2);

    const deltaElem = document.getElementById('wi-delta');
    const sign = delta > 0 ? '+' : '';
    deltaElem.textContent = `${sign}${delta.toFixed(2)}`;
    deltaElem.className = delta > 0.005 ? 'delta-positive' : delta < -0.005 ? 'delta-negative' : 'delta-neutral';

    result.style.display = 'grid';
}
// ============================================================
// SECTION: GUIDE PANEL TOGGLE
// ============================================================
let guideOpen = false;

function toggleGuide() {
    guideOpen = !guideOpen;
    const body = document.getElementById('guide-body');
    const icon = document.getElementById('guide-toggle-icon');
    if (!body) return;
    body.style.display = guideOpen ? 'block' : 'none';
    if (icon) icon.textContent = guideOpen ? '\u25b2' : '\u25bc';
}
