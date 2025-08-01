// Global variables
let currentFolder = '';
let currentFile = '';
let currentColumns = [];
let currentFilters = [];
let currentPage = 1;
let totalPages = 1;

// Filter operators mapping
const OPERATORS = {
    'equals': 'Equals',
    'not_equals': 'Not Equals',
    'contains': 'Contains',
    'greater_than': 'Greater Than',
    'less_than': 'Less Than',
    'greater_equal': 'Greater or Equal',
    'less_equal': 'Less or Equal'
};

function openFileViewer(folderName, fileName) {
    currentFolder = folderName;
    currentFile = fileName;
    currentFilters = [];
    currentPage = 1;
    
    // Set modal title
    document.getElementById('modalFileName').textContent = fileName;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('fileViewerModal'));
    modal.show();
    
    // Show loading state
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('fileInfoContent').style.display = 'none';
    
    // Load file info
    loadFileInfo();
}

function loadFileInfo() {
    fetch(`/api/file-info/${currentFolder}/${currentFile}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            currentColumns = data.columns;
            
            // Update file statistics
            document.getElementById('totalRows').textContent = data.total_rows.toLocaleString();
            document.getElementById('totalColumns').textContent = data.total_columns;
            
            // Setup download button
            setupDownloadButton();
            
            // Hide loading and show content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('fileInfoContent').style.display = 'block';
            
            // Load initial data
            loadData();
        })
        .catch(error => {
            console.error('Error loading file info:', error);
            alert('Error loading file: ' + error.message);
        });
}

function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.onclick = function() {
        downloadFilteredData();
    };
}

function addFilter() {
    const filtersContainer = document.getElementById('filtersContainer');
    const filterId = 'filter_' + Date.now();
    
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filter-row row align-items-center';
    filterDiv.id = filterId;
    
    filterDiv.innerHTML = `
        <div class="col-md-3">
            <label class="form-label">Column</label>
            <select class="form-select filter-column" onchange="updateFilterOptions('${filterId}')">
                <option value="">Select Column</option>
                ${currentColumns.map(col => `<option value="${col.name}">${col.name}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Operator</label>
            <select class="form-select filter-operator">
                ${Object.entries(OPERATORS).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Value</label>
            <input type="text" class="form-control filter-value" placeholder="Enter value">
        </div>
        <div class="col-md-3">
            <label class="form-label">Suggestions</label>
            <select class="form-select filter-suggestions" onchange="selectSuggestion('${filterId}')">
                <option value="">Select from unique values</option>
            </select>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn-remove-filter" onclick="removeFilter('${filterId}')" title="Remove Filter">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insert before the "Add Filter" button
    const addButton = filtersContainer.querySelector('button');
    filtersContainer.insertBefore(filterDiv, addButton);
}

function updateFilterOptions(filterId) {
    const filterDiv = document.getElementById(filterId);
    const columnSelect = filterDiv.querySelector('.filter-column');
    const suggestionsSelect = filterDiv.querySelector('.filter-suggestions');
    
    const selectedColumn = columnSelect.value;
    if (!selectedColumn) {
        suggestionsSelect.innerHTML = '<option value="">Select from unique values</option>';
        return;
    }
    
    // Find column info
    const columnInfo = currentColumns.find(col => col.name === selectedColumn);
    if (columnInfo && columnInfo.unique_values) {
        suggestionsSelect.innerHTML = '<option value="">Select from unique values</option>';
        columnInfo.unique_values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            suggestionsSelect.appendChild(option);
        });
        
        // Show truncation message if there are more unique values
        if (columnInfo.unique_count > 100) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = `... and ${columnInfo.unique_count - 100} more values`;
            option.disabled = true;
            suggestionsSelect.appendChild(option);
        }
    }
}

function selectSuggestion(filterId) {
    const filterDiv = document.getElementById(filterId);
    const suggestionsSelect = filterDiv.querySelector('.filter-suggestions');
    const valueInput = filterDiv.querySelector('.filter-value');
    
    if (suggestionsSelect.value) {
        valueInput.value = suggestionsSelect.value;
        suggestionsSelect.value = '';
    }
}

function removeFilter(filterId) {
    const filterDiv = document.getElementById(filterId);
    filterDiv.remove();
}

function clearFilters() {
    const filterRows = document.querySelectorAll('.filter-row');
    filterRows.forEach(row => row.remove());
    currentFilters = [];
    currentPage = 1;
    loadData();
}

function applyFilters() {
    currentFilters = [];
    const filterRows = document.querySelectorAll('.filter-row');
    
    filterRows.forEach(row => {
        const column = row.querySelector('.filter-column').value;
        const operator = row.querySelector('.filter-operator').value;
        const value = row.querySelector('.filter-value').value;
        
        if (column && value) {
            currentFilters.push({
                column: column,
                operator: operator,
                value: value
            });
        }
    });
    
    currentPage = 1;
    loadData();
}

function loadData(page = 1) {
    currentPage = page;
    
    const requestData = {
        filters: currentFilters,
        page: page,
        per_page: 50
    };
    
    fetch(`/api/query-data/${currentFolder}/${currentFile}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        updateDataTable(data.data);
        updatePagination(data.current_page, data.total_pages, data.total_rows);
        totalPages = data.total_pages;
    })
    .catch(error => {
        console.error('Error loading data:', error);
        alert('Error loading data: ' + error.message);
    });
}

function updateDataTable(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    
    // Clear existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%" class="text-center">No data found with current filters</td></tr>';
        return;
    }
    
    // Create header
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        th.style.minWidth = '120px';
        headerRow.appendChild(th);
    });
    tableHeader.appendChild(headerRow);
    
    // Create body rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value !== null && value !== undefined ? value : '';
            td.style.maxWidth = '200px';
            td.style.overflow = 'hidden';
            td.style.textOverflow = 'ellipsis';
            td.style.whiteSpace = 'nowrap';
            td.title = value; // Show full value on hover
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function updatePagination(currentPage, totalPages, totalRows) {
    const paginationInfo = document.getElementById('paginationInfo');
    const pagination = document.getElementById('pagination');
    
    // Update info
    const startRow = ((currentPage - 1) * 50) + 1;
    const endRow = Math.min(currentPage * 50, totalRows);
    paginationInfo.textContent = `Showing ${startRow}-${endRow} of ${totalRows.toLocaleString()} rows`;
    
    // Clear pagination
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="loadData(${currentPage - 1})">Previous</a>`;
    pagination.appendChild(prevLi);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="loadData(1)">1</a>`;
        pagination.appendChild(li);
        
        if (startPage > 2) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(li);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="loadData(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(li);
        }
        
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="loadData(${totalPages})">${totalPages}</a>`;
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="loadData(${currentPage + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

function downloadFilteredData() {
    const filtersJson = encodeURIComponent(JSON.stringify(currentFilters));
    const downloadUrl = `/api/download/${currentFolder}/${currentFile}?filters=${filtersJson}`;
    
    // Create a temporary link and click it to start download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}