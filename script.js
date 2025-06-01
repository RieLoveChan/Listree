document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('list-container');
    const list = document.getElementById('list');
    const addMenu = document.getElementById('add-menu');

    let radioGroupCounter = 1;
    let currentTargetList = null;

    // Initialize Sortable for the main list and any pre-existing sub-lists
    [list, ...document.querySelectorAll('.sub-list')].forEach(el => {
        new Sortable(el, { animation: 150, ghostClass: 'sortable-ghost' });
    });

    // --- MAIN EVENT LISTENERS ---
    listContainer.addEventListener('click', (e) => {
        // --- Handle Delete Button ---
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            handleDelete(deleteBtn);
            return;
        }

        // --- Handle Add Button (for Items and Sub-Groups) ---
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            e.stopPropagation(); // Prevent document click from hiding menu immediately
            currentTargetList = addBtn.id === 'main-add-btn' ? list : addBtn.closest('li').querySelector('.sub-list');
            showAddMenu(addBtn);
            return;
        }

        // --- Handle Add Radio Option Button ---
        const addRadioOptionBtn = e.target.closest('.add-radio-option-btn');
        if (addRadioOptionBtn) {
            const parentGroup = addRadioOptionBtn.closest('.radio-group');
            const subList = parentGroup.querySelector('.sub-list');
            const newOption = createRadioOption(parentGroup.dataset.groupName);
            subList.appendChild(newOption);
            animateAddition(newOption);
            return;
        }
    });

    // --- Handle selection in the Add Menu ---
    addMenu.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-type]');
        if (!target || !currentTargetList) return;

        const type = target.dataset.type;
        const newItem = type === 'item' ? createItem('New Item') : createRadioGroup(`Radio Group ${radioGroupCounter++}`);

        if (newItem) {
            currentTargetList.appendChild(newItem);
            animateAddition(newItem);
        }
        hideAddMenu();
    });

    // --- Handle auto-checking of parent radio group checkbox ---
    listContainer.addEventListener('change', (e) => {
        if (e.target.matches('input[type="radio"]') && e.target.checked) {
            const parentGroup = e.target.closest('.radio-group');
            if (parentGroup) {
                parentGroup.querySelector('.radio-group-checkbox').checked = true;
            }
        }
    });

    // Hide context menu if clicked outside
    document.addEventListener('click', () => hideAddMenu());

    // --- LOGIC FUNCTIONS ---
    function handleDelete(deleteBtn) {
        const itemToRemove = deleteBtn.closest('li');
        if (!itemToRemove) return;

        // If deleting a selected radio option, uncheck the parent
        const radioInput = itemToRemove.querySelector('input[type="radio"]');
        if (radioInput && radioInput.checked) {
            const parentGroup = itemToRemove.closest('.radio-group');
            if (parentGroup) {
                // Check if any OTHER radio button is checked. If not, uncheck the box.
                const otherOptions = parentGroup.querySelectorAll('input[type="radio"]');
                if (otherOptions.length <= 1) {
                    parentGroup.querySelector('.radio-group-checkbox').checked = false;
                }
            }
        }
        animateRemoval(itemToRemove, () => itemToRemove.remove());
    }


    // --- ELEMENT CREATION FUNCTIONS ---
    function createItem(name) {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div class="item-content">
                <input type="checkbox" class="item-checkbox">
                <span class="item-name" contenteditable="true">${name}</span>
                <button class="add-btn"><i class="fas fa-plus"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
            <ul class="sub-list"></ul>`;
        new Sortable(li.querySelector('.sub-list'), { animation: 150, ghostClass: 'sortable-ghost' });
        return li;
    }

    function createRadioGroup(name) {
        const li = document.createElement('li');
        li.className = 'radio-group';
        const groupName = `radio-group-${Date.now()}`;
        li.dataset.groupName = groupName;
        li.innerHTML = `
            <div class="radio-group-header">
                <input type="checkbox" class="radio-group-checkbox" disabled>
                <span class="radio-group-name" contenteditable="true">${name}</span>
                <button class="add-radio-option-btn"><i class="fas fa-plus"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
            <ul class="sub-list"></ul>`;

        const subList = li.querySelector('.sub-list');
        subList.appendChild(createRadioOption(groupName)); // Start with one option
        new Sortable(subList, { animation: 150, ghostClass: 'sortable-ghost' });
        return li;
    }

    function createRadioOption(groupName) {
        const li = document.createElement('li');
        li.className = 'radio-option';
        li.innerHTML = `
            <div class="radio-option-content">
                <input type="radio" name="${groupName}">
                <span class="radio-option-name" contenteditable="true">Option</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>`;
        return li;
    }

    // --- UI & ANIMATION FUNCTIONS ---
    function showAddMenu(button) {
        const rect = button.getBoundingClientRect();
        addMenu.style.top = `${rect.bottom + window.scrollY}px`;
        addMenu.style.left = `${rect.left + window.scrollX}px`;
        addMenu.classList.remove('hidden');
    }

    function hideAddMenu() {
        addMenu.classList.add('hidden');
        currentTargetList = null;
    }

    function animateAddition(element) {
        element.classList.add('item-added');
        element.addEventListener('animationend', () => {
            element.classList.remove('item-added');
        }, { once: true });
    }

    function animateRemoval(element, callback) {
        element.classList.add('item-removed');
        element.addEventListener('animationend', callback, { once: true });
    }
});
