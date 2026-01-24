// Khởi tạo dữ liệu từ LocalStorage hoặc mảng rỗng
let data = JSON.parse(localStorage.getItem('gpa_data')) || [];

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
    switch(letter) {
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
}

// HÀM RENDER QUAN TRỌNG - ĐÃ FIX ĐẦY ĐỦ
function render() {
    const container = document.getElementById('semesters-container');
    
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="semester-card" style="text-align: center; padding: 40px;">
                <h3 style="color: var(--gray); margin-bottom: 20px;">Chưa có dữ liệu học kỳ</h3>
                <p style="margin-bottom: 25px;">Bắt đầu bằng cách thêm học kỳ đầu tiên hoặc tải dữ liệu từ file JSON.</p>
                <button class="btn btn-primary" onclick="addSemester()" style="margin-right: 10px;">
                    <span class="btn-icon">+</span> Thêm học kỳ đầu tiên
                </button>
                <button class="btn btn-success" onclick="addSampleData()">
                    <span class="btn-icon">📊</span> Tải dữ liệu từ file
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
function addSampleData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = importDataFromFile;
    
    document.body.appendChild(fileInput);
    fileInput.click();
    
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 100);
}

function importDataFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/json") {
        alert("Vui lòng chọn file JSON!");
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.gpaData || !Array.isArray(importedData.gpaData)) {
                alert("File JSON không đúng định dạng!");
                return;
            }
            
            if (data.length > 0) {
                if (!confirm("Thao tác này sẽ thay thế dữ liệu hiện tại. Bạn có chắc không?")) {
                    return;
                }
            }
            
            data = importedData.gpaData;
            
            data.forEach(sem => {
                if (sem.courses) {
                    sem.courses.forEach(course => {
                        course.finalScore = calculateFinalScore(course);
                    });
                }
            });
            
            saveData();
            render();
            alert("Đã tải dữ liệu thành công!");
        } catch (error) {
            alert("Lỗi khi đọc file JSON: " + error.message);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function exportData() {
    const overallGPA = calculateOverallGPA();
    const overallScore = calculateOverallScore();
    
    const exportData = {
        timestamp: new Date().toISOString(),
        gpaData: data,
        overallGPA: overallGPA,
        overallScore: overallScore
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `HUIT-GPA-Long-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function clearAllData() {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu? Thao tác này không thể hoàn tác.")) {
        data = [];
        saveData();
        render();
    }
}

// Khởi chạy lần đầu
document.addEventListener('DOMContentLoaded', function() {
    render();
    updateSummary();
});
