document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. ANA SİTE RANDEVU FORMU ----
    const bookingForm = document.getElementById('realBookingForm');
    const formAlert = document.getElementById('formAlert');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const userPhone = document.getElementById('userPhone').value.trim();
            const selectedService = document.getElementById('selectedService').value;
            const appointmentDate = document.getElementById('appointmentDate').value;

            if (fullName && userPhone && selectedService && appointmentDate) {
                let appointments = JSON.parse(localStorage.getItem('gaia_appointments')) || [];
                
                const newAppointment = {
                    id: Date.now(),
                    fullName,
                    userPhone,
                    selectedService,
                    appointmentDate,
                    status: 'Beklemede', // Beklemede, Onaylandı, Reddedildi
                    appointmentTime: '',
                    rejectReason: '',
                    note: ''
                };

                appointments.push(newAppointment);
                localStorage.setItem('gaia_appointments', JSON.stringify(appointments));

                formAlert.style.display = 'block';
                bookingForm.reset();

                setTimeout(() => {
                    formAlert.style.display = 'none';
                }, 4000);
            }
        });
    }

    // ---- 2. İŞLETME PANELİ GİRİŞ VE SEKMELER ----
    const loginScreen = document.getElementById('loginScreen');
    const adminPanelScreen = document.getElementById('adminPanelScreen');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginScreen && adminPanelScreen) {
        if (sessionStorage.getItem('gaia_admin_logged') === 'true') {
            showPanel();
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('adminEmail').value.trim();
            const passInput = document.getElementById('adminPassword').value.trim();

            if (emailInput === 'gaiastudiolara@gmail.com' && passInput === 'Gaiastudiooo11') {
                sessionStorage.setItem('gaia_admin_logged', 'true');
                loginError.style.display = 'none';
                showPanel();
            } else {
                loginError.style.display = 'block';
            }
        });

        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('gaia_admin_logged');
            adminPanelScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
            loginForm.reset();
        });
    }

    function showPanel() {
        loginScreen.style.display = 'none';
        adminPanelScreen.style.display = 'block';
        renderAdminTables();
    }

    // Sekme Geçişleri
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Tabloları ve Sayıları Güncelleme
    function renderAdminTables() {
        let appointments = JSON.parse(localStorage.getItem('gaia_appointments')) || [];

        const pendingList = appointments.filter(a => a.status === 'Beklemede');
        const approvedList = appointments.filter(a => a.status === 'Onaylandı');
        const rejectedList = appointments.filter(a => a.status === 'Reddedildi');

        document.getElementById('badgePending').textContent = pendingList.length;
        document.getElementById('badgeApproved').textContent = approvedList.length;
        document.getElementById('badgeRejected').textContent = rejectedList.length;

        // 1. Bekleyenler Tablosu (Reddet direkt rejectAppointment fonksiyonunu tetikler)
        let pendingHtml = '';
        if (pendingList.length === 0) {
            pendingHtml = '<tr><td colspan="5" class="empty-text">Bekleyen talep bulunmuyor.</td></tr>';
        } else {
            pendingList.forEach(app => {
                pendingHtml += `
                    <tr>
                        <td><strong>${app.fullName}</strong></td>
                        <td><a href="tel:${app.userPhone}" style="color:var(--text-main); text-decoration:none;">${app.userPhone}</a></td>
                        <td>${app.selectedService}</td>
                        <td>${app.appointmentDate}</td>
                        <td>
                            <button class="action-btn approve-btn" onclick="openApprovalModal(${app.id})">Onayla</button>
                            <button class="action-btn delete-btn" onclick="rejectAppointment(${app.id})">Reddet</button>
                        </td>
                    </tr>
                `;
            });
        }
        document.getElementById('pendingTableBody').innerHTML = pendingHtml;

        // 2. Onaylananlar Tablosu
        let approvedHtml = '';
        if (approvedList.length === 0) {
            approvedHtml = '<tr><td colspan="6" class="empty-text">Onaylanmış seans bulunmuyor.</td></tr>';
        } else {
            approvedList.forEach(app => {
                approvedHtml += `
                    <tr>
                        <td><strong>${app.fullName}</strong></td>
                        <td><a href="tel:${app.userPhone}" style="color:var(--text-main); text-decoration:none;">${app.userPhone}</a></td>
                        <td>${app.selectedService}</td>
                        <td>${app.appointmentDate} · <strong style="color:var(--accent);">${app.appointmentTime || '10:00'}</strong></td>
                        <td>${app.note ? app.note : '-'}</td>
                        <td>
                            <button class="action-btn delete-btn" onclick="deleteAppointment(${app.id})">Sil</button>
                        </td>
                    </tr>
                `;
            });
        }
        document.getElementById('approvedTableBody').innerHTML = approvedHtml;

        // 3. Reddedilenler Tablosu
        let rejectedHtml = '';
        if (rejectedList.length === 0) {
            rejectedHtml = '<tr><td colspan="5" class="empty-text">Reddedilen talep bulunmuyor.</td></tr>';
        } else {
            rejectedList.forEach(app => {
                rejectedHtml += `
                    <tr>
                        <td><strong>${app.fullName}</strong></td>
                        <td><a href="tel:${app.userPhone}" style="color:var(--text-main); text-decoration:none;">${app.userPhone}</a></td>
                        <td>${app.selectedService}</td>
                        <td>${app.appointmentDate}</td>
                        <td>
                            <button class="action-btn delete-btn" onclick="deleteAppointment(${app.id})">Kaldır</button>
                        </td>
                    </tr>
                `;
            });
        }
        document.getElementById('rejectedTableBody').innerHTML = rejectedHtml;
    }

    // ---- MODAL YÖNETİMİ (Sadece Onay İçin Çalışır) ----
    let activeModalId = null;

    window.openApprovalModal = function(id) {
        activeModalId = id;
        const modal = document.getElementById('actionModal');
        const modalAlert = document.getElementById('modalAlert');
        
        if (modalAlert) modalAlert.style.display = 'none';

        document.getElementById('modalTimeInput').value = '10:00';
        document.getElementById('modalNoteInput').value = '';
        
        modal.style.display = 'flex';
    };

    const cancelBtn = document.getElementById('modalCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('actionModal').style.display = 'none';
        });
    }

    const confirmBtn = document.getElementById('modalConfirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            let appointments = JSON.parse(localStorage.getItem('gaia_appointments')) || [];
            const targetApp = appointments.find(a => a.id === activeModalId);

            if (!targetApp) return;

            const timeVal = document.getElementById('modalTimeInput').value;
            const noteVal = document.getElementById('modalNoteInput').value;

            // Çakışma Kontrolü
            const conflict = appointments.some(a => a.status === 'Onaylandı' && a.appointmentDate === targetApp.appointmentDate && a.appointmentTime === timeVal && a.id !== activeModalId);

            if (conflict) {
                const modalAlert = document.getElementById('modalAlert');
                if (modalAlert) {
                    modalAlert.style.display = 'block';
                    modalAlert.textContent = 'Bu tarih ve saatte zaten onaylanmış başka bir seans var!';
                }
                return;
            }

            targetApp.status = 'Onaylandı';
            targetApp.appointmentTime = timeVal;
            targetApp.note = noteVal;

            localStorage.setItem('gaia_appointments', JSON.stringify(appointments));
            document.getElementById('actionModal').style.display = 'none';
            renderAdminTables();
        });
    }

    // Direkt Reddetme Fonksiyonu
    window.rejectAppointment = function(id) {
        let appointments = JSON.parse(localStorage.getItem('gaia_appointments')) || [];
        const targetApp = appointments.find(a => a.id === id);

        if (targetApp) {
            targetApp.status = 'Reddedildi';
            localStorage.setItem('gaia_appointments', JSON.stringify(appointments));
            renderAdminTables();
        }
    };

    window.deleteAppointment = function(id) {
        let appointments = JSON.parse(localStorage.getItem('gaia_appointments')) || [];
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem('gaia_appointments', JSON.stringify(appointments));
        renderAdminTables();
    };
});
