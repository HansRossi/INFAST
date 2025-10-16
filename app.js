// State
let currentDocType = '';
let itemCounter = 1;

// Document type names
const docTypeNames = {
    faktura: 'FAKTURA',
    zalohova: 'ZÁLOHOVÁ FAKTURA',
    pokladni: 'POKLADNÍ DOKLAD',
    zjednoduseny: 'ZJEDNODUŠENÝ DAŇOVÝ DOKLAD',
    dodaci: 'DODACÍ LIST'
};

// Field configurations for each document type
const docTypeConfig = {
    faktura: {
        showBuyerDetails: true,
        showPrices: true,
        showVAT: true,
        showBankAccount: true,
        showPaymentMethod: true,
        additionalFields: []
    },
    zalohova: {
        showBuyerDetails: true,
        showPrices: true,
        showVAT: true,
        showBankAccount: true,
        showPaymentMethod: true,
        additionalFields: ['advancePercent']
    },
    pokladni: {
        showBuyerDetails: false,
        showPrices: true,
        showVAT: true,
        showBankAccount: false,
        showPaymentMethod: true,
        additionalFields: []
    },
    zjednoduseny: {
        showBuyerDetails: false,
        showPrices: true,
        showVAT: true,
        showBankAccount: false,
        showPaymentMethod: true,
        additionalFields: []
    },
    dodaci: {
        showBuyerDetails: true,
        showPrices: false,
        showVAT: false,
        showBankAccount: false,
        showPaymentMethod: false,
        additionalFields: []
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setupEventListeners();
    setupInputValidation();
    setDefaultDates();
    console.log('✅ INTURY loaded successfully');
});

// Event listeners
function setupEventListeners() {
    // Document type buttons
    document.querySelectorAll('.doc-button').forEach(button => {
        button.addEventListener('click', () => {
            currentDocType = button.dataset.type;
            showFormScreen();
        });
    });

    // Navigation
    document.getElementById('backButton').addEventListener('click', showHomeScreen);
    document.getElementById('previewBackButton').addEventListener('click', showFormScreen);

    // Form submission
    document.getElementById('documentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('📝 Form submitted!');
        generateDocument();
    });

    // Screenshot button
    document.getElementById('screenshotButton').addEventListener('click', takeScreenshot);

    // Dynamic items
    document.getElementById('addItemButton').addEventListener('click', addItem);
}

// Screenshot function
async function takeScreenshot() {
    const button = document.getElementById('screenshotButton');
    const originalText = button.textContent;
    button.textContent = 'Создание скриншота...';
    button.disabled = true;

    try {
        const documentPaper = document.querySelector('.document-paper');
        const canvas = await html2canvas(documentPaper, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTypeNames[currentDocType]}_${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            button.textContent = originalText;
            button.disabled = false;
        });
    } catch (error) {
        console.error('Ошибка при создании скриншота:', error);
        alert('Не удалось создать скриншот. Попробуйте сделать скриншот вручную (Cmd+Shift+4 на Mac).');
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Screen navigation
function showHomeScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    document.getElementById('documentForm').reset();
    document.getElementById('itemsContainer').innerHTML = '';
    itemCounter = 1;
    addItem();
    setDefaultDates();
}

function showFormScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('formScreen').classList.add('active');
    document.getElementById('formTitle').textContent = docTypeNames[currentDocType];
    
    // Reset items and add first one
    document.getElementById('itemsContainer').innerHTML = '';
    itemCounter = 1;
    
    // Configure form based on document type
    configureFormForDocType();
    
    // Add first item after configuration
    addItem();
}

function showPreviewScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('previewScreen').classList.add('active');
}

// Configure form based on document type
function configureFormForDocType() {
    const config = docTypeConfig[currentDocType];
    console.log('⚙️ Configuring form for:', currentDocType, config);
    
    // Buyer section
    const buyerSection = document.querySelector('.form-section:has(#buyerName)');
    if (buyerSection) {
        buyerSection.style.display = config.showBuyerDetails ? 'block' : 'none';
        // Remove required from buyer fields if hidden
        if (!config.showBuyerDetails) {
            buyerSection.querySelectorAll('input').forEach(input => {
                input.removeAttribute('required');
            });
        }
    }
    
    // Bank account field (using correct ID)
    const bankField = document.querySelector('.form-group:has(#sellerBank)');
    if (bankField) {
        bankField.style.display = config.showBankAccount ? 'block' : 'none';
    }
    
    // Price columns in items
    const itemsContainer = document.getElementById('itemsContainer');
    if (itemsContainer) {
        if (config.showPrices) {
            itemsContainer.classList.remove('no-prices');
        } else {
            itemsContainer.classList.add('no-prices');
        }
    }
    
    // Add additional fields if needed
    if (config.additionalFields.includes('advancePercent')) {
        addAdvancePercentField();
    } else {
        removeAdvancePercentField();
    }
}

// Add advance percent field for zalohova faktura
function addAdvancePercentField() {
    const docInfoSection = document.querySelector('.form-section:has(#docNumber)');
    if (!document.getElementById('advancePercent')) {
        const formGrid = docInfoSection.querySelector('.form-grid');
        const advanceField = document.createElement('div');
        advanceField.className = 'form-group';
        advanceField.innerHTML = `
            <label for="advancePercent">Procent zálohy *</label>
            <input type="number" id="advancePercent" min="1" max="100" value="50" required>
        `;
        formGrid.appendChild(advanceField);
    }
}

function removeAdvancePercentField() {
    const advanceField = document.querySelector('.form-group:has(#advancePercent)');
    if (advanceField) {
        advanceField.remove();
    }
}

// Items management
function addItem() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;
    const config = docTypeConfig[currentDocType] || docTypeConfig.faktura;
    const itemId = itemCounter++;
    
    const priceFields = config.showPrices ? `
        <div class="item-field">
            <label for="itemPrice${itemId}">Cena/ks (Kč) *</label>
            <input type="text" id="itemPrice${itemId}" class="item-price" placeholder="0.00" required>
        </div>
        <div class="item-field">
            <label for="itemVAT${itemId}">DPH (%) *</label>
            <select id="itemVAT${itemId}" class="item-vat" required>
                <option value="21">21%</option>
                <option value="15">15%</option>
                <option value="12">12%</option>
                <option value="10">10%</option>
                <option value="0">0%</option>
            </select>
        </div>
    ` : '';
    
    const itemHTML = `
        <div class="item-row" data-item-id="${itemId}">
            <div class="item-field">
                <label for="itemName${itemId}">Název položky *</label>
                <input type="text" id="itemName${itemId}" class="item-name" maxlength="100" required>
            </div>
            <div class="item-field">
                <label for="itemQty${itemId}">Množství *</label>
                <input type="text" id="itemQty${itemId}" class="item-qty" placeholder="1" required>
            </div>
            ${priceFields}
            <div class="item-actions">
                <button type="button" class="remove-item" onclick="removeItem(${itemId})">×</button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    setupItemValidation(itemId);
}

function removeItem(itemId) {
    const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
    if (document.querySelectorAll('.item-row').length > 1) {
        itemRow.remove();
    }
}

// Make removeItem globally accessible
window.removeItem = removeItem;

// Validation
function setupInputValidation() {
    // Document number - only digits (max 15)
    const docNumber = document.getElementById('docNumber');
    docNumber?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 15);
    });

    // Names - limit length
    ['sellerName', 'buyerName'].forEach(id => {
        const elem = document.getElementById(id);
        elem?.addEventListener('input', (e) => {
            e.target.value = e.target.value.slice(0, 100);
        });
    });

    // Addresses - limit length
    ['sellerAddress', 'buyerAddress'].forEach(id => {
        const elem = document.getElementById(id);
        elem?.addEventListener('input', (e) => {
            e.target.value = e.target.value.slice(0, 150);
        });
    });

    // Cities - limit length
    ['sellerCity', 'buyerCity'].forEach(id => {
        const elem = document.getElementById(id);
        elem?.addEventListener('input', (e) => {
            e.target.value = e.target.value.slice(0, 50);
        });
    });

    // Email - limit length
    const email = document.getElementById('sellerEmail');
    email?.addEventListener('input', (e) => {
        e.target.value = e.target.value.slice(0, 100);
    });

    // IČO - 8 digits
    const ico = document.getElementById('sellerICO');
    ico?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    });

    const buyerIco = document.getElementById('buyerICO');
    buyerIco?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    });

    // DIČ - CZ + numbers
    const dic = document.getElementById('sellerDIC');
    dic?.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^CZ0-9]/g, '');
        if (value && !value.startsWith('CZ')) {
            value = 'CZ' + value.replace(/CZ/g, '');
        }
        e.target.value = value.slice(0, 12);
    });

    const buyerDic = document.getElementById('buyerDIC');
    buyerDic?.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^CZ0-9]/g, '');
        if (value && !value.startsWith('CZ')) {
            value = 'CZ' + value.replace(/CZ/g, '');
        }
        e.target.value = value.slice(0, 12);
    });

    // PSČ - format XXX XX (exactly 5 digits)
    const psc = document.getElementById('sellerZip');
    psc?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 5);
        if (value.length > 3) {
            value = value.slice(0, 3) + ' ' + value.slice(3);
        }
        e.target.value = value;
    });

    const buyerPsc = document.getElementById('buyerZip');
    buyerPsc?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 5);
        if (value.length > 3) {
            value = value.slice(0, 3) + ' ' + value.slice(3);
        }
        e.target.value = value;
    });

    // Phone - 9 digits formatted as XXX XXX XXX
    const phone = document.getElementById('sellerPhone');
    phone?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 9);
        if (value.length > 6) {
            value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
        } else if (value.length > 3) {
            value = value.slice(0, 3) + ' ' + value.slice(3);
        }
        e.target.value = value;
    });

    // Bank account - format XXXXXXXXX/XXXX (9 digits / 4 digits)
    const bankAccount = document.getElementById('sellerBank');
    bankAccount?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d\/]/g, '');
        // Remove multiple slashes
        value = value.replace(/\/{2,}/g, '/');
        const parts = value.split('/');
        if (parts[0]) parts[0] = parts[0].slice(0, 9);
        if (parts[1]) parts[1] = parts[1].slice(0, 4);
        if (parts.length > 2) parts.length = 2; // Only one slash allowed
        e.target.value = parts.join('/');
    });
}

function setupItemValidation(itemId) {
    // Quantity - numbers and decimal (max 10 chars)
    const qty = document.getElementById(`itemQty${itemId}`);
    qty?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.,]/g, '');
        // Replace comma with dot
        value = value.replace(',', '.');
        // Allow only one dot
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        e.target.value = value.slice(0, 10);
        calculateTotals(); // RECALCULATE ON CHANGE
    });

    // Price - numbers and decimal (max 12 chars)
    const price = document.getElementById(`itemPrice${itemId}`);
    price?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.,]/g, '');
        // Replace comma with dot
        value = value.replace(',', '.');
        // Allow only one dot
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        e.target.value = value.slice(0, 12);
        calculateTotals(); // RECALCULATE ON CHANGE
    });

    // VAT change - also recalculate
    const vat = document.getElementById(`itemVAT${itemId}`);
    vat?.addEventListener('change', calculateTotals);
}

// Calculate totals
function calculateTotals() {
    const config = docTypeConfig[currentDocType];
    if (!config || !config.showPrices) return;

    let totalWithoutVAT = 0;
    let totalVAT = 0;

    // Loop through all items
    document.querySelectorAll('.item-row').forEach(row => {
        const itemId = row.dataset.itemId;
        const qtyInput = document.getElementById(`itemQty${itemId}`);
        const priceInput = document.getElementById(`itemPrice${itemId}`);
        const vatSelect = document.getElementById(`itemVAT${itemId}`);

        if (!qtyInput || !priceInput || !vatSelect) return;

        const qty = parseFloat(qtyInput.value.replace(',', '.')) || 0;
        const price = parseFloat(priceInput.value.replace(',', '.')) || 0;
        const vatRate = parseFloat(vatSelect.value) || 0;

        const itemTotal = qty * price;
        const itemVAT = itemTotal * (vatRate / 100);

        totalWithoutVAT += itemTotal;
        totalVAT += itemVAT;
    });

    const total = totalWithoutVAT + totalVAT;

    // Update display
    document.getElementById('totalWithoutVAT').textContent = formatPrice(totalWithoutVAT);
    document.getElementById('totalVAT').textContent = formatPrice(totalVAT);
    document.getElementById('totalWithVAT').textContent = formatPrice(total);
}

// Default dates
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    document.getElementById('docDate').value = today;
    document.getElementById('dueDate').value = in14Days;
    document.getElementById('taxableDate').value = today;
}

// Format price
function formatPrice(amount) {
    return new Intl.NumberFormat('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' Kč';
}

// Generate document
function generateDocument() {
    console.log('🚀 Generating document for type:', currentDocType);
    const config = docTypeConfig[currentDocType];
    
    if (!config) {
        console.error('❌ No config for document type:', currentDocType);
        alert('Chyba: Neplatný typ dokumentu');
        return;
    }
    
    const formData = {
        docNumber: document.getElementById('docNumber').value,
        docDate: document.getElementById('docDate').value,
        dueDate: document.getElementById('dueDate').value,
        taxableDate: document.getElementById('taxableDate').value,
        sellerName: document.getElementById('sellerName').value,
        sellerAddress: document.getElementById('sellerAddress').value,
        sellerCity: document.getElementById('sellerCity').value,
        sellerPSC: document.getElementById('sellerZip').value,
        sellerICO: document.getElementById('sellerICO').value,
        sellerDIC: document.getElementById('sellerDIC').value,
        sellerPhone: document.getElementById('sellerPhone').value,
        sellerEmail: document.getElementById('sellerEmail').value,
        sellerBankAccount: document.getElementById('sellerBank')?.value || '',
        paymentMethod: 'Bankovní převod',
        advancePercent: document.getElementById('advancePercent')?.value || null
    };

    if (config.showBuyerDetails) {
        formData.buyerName = document.getElementById('buyerName').value;
        formData.buyerAddress = document.getElementById('buyerAddress').value;
        formData.buyerCity = document.getElementById('buyerCity').value;
        formData.buyerPSC = document.getElementById('buyerZip').value;
        formData.buyerICO = document.getElementById('buyerICO').value;
        formData.buyerDIC = document.getElementById('buyerDIC').value;
    }

    // Collect items
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const itemId = row.dataset.itemId;
        const item = {
            name: document.getElementById(`itemName${itemId}`).value,
            qty: parseFloat(document.getElementById(`itemQty${itemId}`).value.replace(',', '.'))
        };
        
        if (config.showPrices) {
            item.price = parseFloat(document.getElementById(`itemPrice${itemId}`).value.replace(',', '.'));
            item.vat = parseInt(document.getElementById(`itemVAT${itemId}`).value);
            item.total = item.qty * item.price;
            item.vatAmount = item.total * (item.vat / 100);
            item.totalWithVAT = item.total + item.vatAmount;
        }
        
        items.push(item);
    });

    formData.items = items;

    // Calculate totals
    if (config.showPrices) {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const vatTotal = items.reduce((sum, item) => sum + item.vatAmount, 0);
        const total = subtotal + vatTotal;
        
        formData.subtotal = subtotal;
        formData.vatTotal = vatTotal;
        formData.total = total;
        
        // For zalohova faktura, calculate advance amount
        if (currentDocType === 'zalohova' && formData.advancePercent) {
            formData.advanceAmount = total * (formData.advancePercent / 100);
        }
    }

    console.log('✅ Form data collected:', formData);
    
    try {
        buildDocument(formData);
        showPreviewScreen();
        console.log('✅ Document generated successfully');
    } catch (error) {
        console.error('❌ Error generating document:', error);
        alert('Chyba při generování dokumentu: ' + error.message);
    }
}

// Build document HTML
function buildDocument(data) {
    const config = docTypeConfig[currentDocType];
    const documentPaper = document.querySelector('.document-paper');
    
    let html = `
        <div class="doc-header">
            <h1 class="doc-title">${docTypeNames[currentDocType]}</h1>
        </div>

        <div class="doc-info-box">
            <div class="info-row">
                <span class="info-label">Číslo dokladu:</span>
                <span class="info-value">${data.docNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Datum vystavení:</span>
                <span class="info-value">${formatDate(data.docDate)}</span>
            </div>
            ${config.showPrices ? `
            <div class="info-row">
                <span class="info-label">Datum splatnosti:</span>
                <span class="info-value">${formatDate(data.dueDate)}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Datum ${currentDocType === 'dodaci' ? 'dodání' : 'zdanitelného plnění'}:</span>
                <span class="info-value">${formatDate(data.taxableDate)}</span>
            </div>
            ${data.advancePercent ? `
            <div class="info-row">
                <span class="info-label">Procent zálohy:</span>
                <span class="info-value">${data.advancePercent}%</span>
            </div>
            ` : ''}
        </div>

        <div class="parties-container">
            <div class="party-box">
                <h3 class="party-title">${currentDocType === 'dodaci' ? 'Odesílatel' : 'Dodavatel'}</h3>
                <div class="party-info">
                    <strong>${data.sellerName}</strong><br>
                    ${data.sellerAddress}<br>
                    ${data.sellerPSC} ${data.sellerCity}<br>
                    <br>
                    IČO: ${data.sellerICO}<br>
                    DIČ: ${data.sellerDIC}<br>
                    Tel: +420 ${data.sellerPhone}<br>
                    Email: ${data.sellerEmail}
                    ${config.showBankAccount && data.sellerBankAccount ? `<br>Č. účtu: ${data.sellerBankAccount}` : ''}
                </div>
            </div>

            ${config.showBuyerDetails ? `
            <div class="party-box">
                <h3 class="party-title">${currentDocType === 'dodaci' ? 'Příjemce' : 'Odběratel'}</h3>
                <div class="party-info">
                    <strong>${data.buyerName}</strong><br>
                    ${data.buyerAddress}<br>
                    ${data.buyerPSC} ${data.buyerCity}<br>
                    <br>
                    IČO: ${data.buyerICO}<br>
                    ${data.buyerDIC ? `DIČ: ${data.buyerDIC}` : ''}
                </div>
            </div>
            ` : ''}
        </div>

        <div class="items-section">
            <h3 class="section-title">Položky ${currentDocType === 'dodaci' ? 'dodávky' : 'faktury'}</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Název</th>
                        <th>Množství</th>
                        ${config.showPrices ? `
                        <th>Cena/ks</th>
                        <th>DPH</th>
                        <th>Celkem</th>
                        ` : ''}
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty}</td>
                            ${config.showPrices ? `
                            <td>${formatPrice(item.price)}</td>
                            <td>${item.vat}%</td>
                            <td>${formatPrice(item.totalWithVAT)}</td>
                            ` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${config.showPrices ? `
        <div class="totals-section">
            <div class="totals-row">
                <span>Celkem bez DPH:</span>
                <span>${formatPrice(data.subtotal)}</span>
            </div>
            <div class="totals-row">
                <span>DPH celkem:</span>
                <span>${formatPrice(data.vatTotal)}</span>
            </div>
            <div class="totals-row total">
                <span>${data.advanceAmount ? 'Celková částka:' : 'CELKEM K ÚHRADĚ:'}</span>
                <span>${formatPrice(data.total)}</span>
            </div>
            ${data.advanceAmount ? `
            <div class="totals-row total">
                <span>ZÁLOHA K ÚHRADĚ (${data.advancePercent}%):</span>
                <span>${formatPrice(data.advanceAmount)}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}

        ${config.showPaymentMethod ? `
        <div class="notes-section">
            <strong>Způsob úhrady:</strong> ${data.paymentMethod}
        </div>
        ` : ''}

        <div class="doc-footer">
            <p>Jsme plátci DPH. Tento doklad byl vyhotoven elektronicky a je platný bez podpisu a razítka.</p>
        </div>
    `;
    
    documentPaper.innerHTML = html;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
}

// Create stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 120;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        // random sizes
        const sizeRand = Math.random();
        if (sizeRand < 0.6) star.className = 'star small';
        else if (sizeRand < 0.9) star.className = 'star medium';
        else star.className = 'star large';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = (Math.random() * 6) + 's';
        star.style.animationDuration = (Math.random() * 6 + 6) + 's';
        // subtle horizontal parallax
        star.style.transform = `translateX(${(Math.random() - 0.5) * 8}px)`;
        starsContainer.appendChild(star);
    }

    // arrange document types into visual 3 + 2 layout by wrapping last two in a centered row
    const docTypes = document.querySelector('.document-types');
    if (docTypes) {
        const buttons = Array.from(docTypes.querySelectorAll('.doc-button'));
        if (buttons.length >= 5 && !docTypes.querySelector('.row-2')) {
            // remove last two and place them into a new container
            const row2 = document.createElement('div');
            row2.className = 'row-2';
            // move last two buttons
            row2.appendChild(buttons[3]);
            row2.appendChild(buttons[4]);
            docTypes.appendChild(row2);
        }
    }
}
