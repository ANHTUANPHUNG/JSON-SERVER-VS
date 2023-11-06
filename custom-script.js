const bodyCustomer = document.querySelector("#tbCustomer tbody");

async function fetchAllPerson() {
    const response = await fetch("http://localhost:3300/persons");
    const persons = await response.json();
    return persons;
}

const getAllPerson = async () => {
    const persons = await fetchAllPerson();
    console.log(persons);

    persons.forEach((item) => {
        const str = renderPerson(item);
        bodyCustomer.innerHTML += str;
    });
};

const renderPerson = (obj) => {
    let transferButton = '';
    let withdrawButton = '';
    if (obj.balance > 0) {
        transferButton = `
            <td>
                <button class="btn btn-outline-primary" onclick="transferCustomer(${obj.id})">
                    <i class="fas fa-exchange-alt"></i>
                </button>
            </td>
        `;
        withdrawButton = `
            <td>
                <button class="btn btn-outline-warning" onclick="withdrawCustomer(${obj.id})">
                    <i class="fas fa-minus"></i>
                </button>
            </td>
        `;
    }

    return `
        <tr>
            <td>${obj.id}</td>
            <td>${obj.fullName}</td>
            <td>${obj.email}</td>
            <td>${obj.phone}</td>
            <td>${obj.address}</td>
            <td>${Math.round(obj.balance * 100) / 100}</td>
            <td>
                <button class="btn btn-outline-secondary" onclick="editPerson(${obj.id})" >
                    <i class="far fa-edit"></i>
                    <a href=""></a>
                </button>
            </td>
            <td>
                <button class="btn btn-outline-success" onclick="depositCustomer(${obj.id})" >
                    <i class="fas fa-plus"></i>
                </button>
            </td>
            ${withdrawButton}
            ${transferButton}
            <td>
                <button class="btn btn-outline-danger" onclick="deletePerson(${obj.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
};


getAllPerson();
const modal = document.getElementById("addCustomerModal");
const modalEdit = document.getElementById("editCustomerModal");
const modalDeposit = document.getElementById("editCustomerModal");

const btn = document.getElementById("created");
const btnEdit = document.getElementById("edited");

const closeBtn = document.getElementById("closeModal");
const formData = {};

btn.addEventListener("click", function (e) {
    modal.style.display = "block";
});
closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});


window.addEventListener("click", function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    } else if (event.target == modalEdit) {
        modalEdit.style.display = "none"
    } else if (event.target == modalDeposit) {
        modalDeposit.style.display = "none"
    }
});


const customerForm = document.getElementById("customerForm");
function submit(event) {
    event.preventDefault();
}

customerForm.onsubmit = async function (event) {

    event.preventDefault();

    const inputFields = customerForm.querySelectorAll(".form-control");

    inputFields.forEach((input) => {
        const fieldName = input.id;
        const fieldValue = input.value;
        formData[fieldName] = fieldValue;
        formData.balance = 0;

    });

    try {
        const response = await fetch("http://localhost:3300/persons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
        if (response.ok) {

        } else {
            console.error("Tạo khách hàng thất bại");
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
};
const deletePerson = async (personId) => {
    const confirmed = confirm("Bạn chắc chắn xóa tài khoản này?");
    if (confirmed) {
        const response = await fetch(`http://localhost:3300/persons/${personId}`, {
            method: "DELETE"
        });
        if (response.ok) {
            getAllPerson();
        } else {
            console.error("Xóa khách hàng thất bại");
        }
    }
}

async function findPersonById(personId) {
    const persons = await fetchAllPerson();

    return persons.find((person) => person.id === personId);
}
const data = {};

async function editPerson(personId) {
    const editForm = document.getElementById("editCustomerModal");
    editForm.style.display = "block";
    const editClose = document.getElementById("closeModalEdit");
    editClose.addEventListener("click", function () {
        editForm.style.display = "none";
    });
    const customer = await findPersonById(personId);
    if (!customer) {
        return;
    }

    const inputFieldsEdit = editForm.querySelectorAll(".form-control");
    inputFieldsEdit.forEach((input) => {
        const fieldName = input.id;
        input.value = customer[fieldName];
    });
    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const inputFieldsEditNew = editForm.querySelectorAll(".form-control");
        inputFieldsEditNew.forEach((input) => {
            const fieldName = input.id;
            const fieldValue = input.value;
            data[fieldName] = fieldValue;
        });
        try {
            const response = await fetch(`http://localhost:3300/persons/${personId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
            } else {
                console.error("Cập nhật thông tin khách hàng thất bại");
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
    });
}
async function depositCustomer(personId) {
    const depositCustomer = document.getElementById("depositModal")
    depositCustomer.style.display = "block";
    const closeModalDeposit = document.getElementById("closeModalDeposit");
    closeModalDeposit.addEventListener("click", () => {
        depositCustomer.style.display = "none";
    })
    const customer = await findPersonById(personId);
    const inputFieldsDeposit = depositCustomer.querySelectorAll(".form-control");
    inputFieldsDeposit.forEach((input) => {
        const fieldName = input.id;
        input.value = customer[fieldName];

    });
    depositCustomer.querySelector("#transactionAmount").value = 0;
    depositCustomer.addEventListener("submit", async function (e) {
        e.preventDefault();
        const inputFieldsEditNew = depositCustomer.querySelectorAll(".form-control");
        inputFieldsEditNew.forEach((input) => {
            const fieldName = input.id;
            const fieldValue = input.value;
            data[fieldName] = fieldValue;

        });
        const updateBalance = parseFloat(depositCustomer.querySelector("#transactionAmount").value) + parseFloat(customer.balance)
        console.log(updateBalance);
        data.balance = updateBalance
        if (data.transactionAmount > 10 || data.transferAmount < 1000000000) {
            data.dateTime = new Date()
            const timeDeposit = data.dateTime;
            const afterTransaction = data.balance
            const fullNameSender = document.querySelector("#depositForm #fullName").value;
            const beforeTransaction = document.querySelector("#depositForm #balance").value;
            const transactionAmountNumber = document.querySelector("#depositForm #transactionAmount").value;
            const response = await fetch(`http://localhost:3300/persons/${personId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await fetch(`http://localhost:3300/deposit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timeDeposit, fullNameSender, beforeTransaction, afterTransaction, transactionAmountNumber }),
            });
            if (response.ok) {
                Swal.fire({
                    title: 'Created',
                    text: 'Thêm tiền thành công.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Thêm tiền thất bại.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Thêm tiền thất bại.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
}
async function withdrawCustomer(personId) {
    const withdrawCustomer = document.getElementById("withdrawModal")
    withdrawCustomer.style.display = "block";
    const closeModalWithdraw = document.getElementById("closeModalWithdraw");
    closeModalWithdraw.addEventListener("click", () => {
        withdrawCustomer.style.display = "none";
    })
    const customer = await findPersonById(personId);
    const inputFieldsWithdraw = withdrawCustomer.querySelectorAll(".form-control");
    inputFieldsWithdraw.forEach((input) => {
        const fieldName = input.id;
        input.value = customer[fieldName];

    });
    withdrawCustomer.querySelector("#transactionAmount").value = 0;
    withdrawCustomer.addEventListener("submit", async function (e) {
        e.preventDefault();
        const inputFieldsEditNew = withdrawCustomer.querySelectorAll(".form-control");
        inputFieldsEditNew.forEach((input) => {
            const fieldName = input.id;
            const fieldValue = input.value;
            data[fieldName] = fieldValue;

        });
        const balanceCheck = document.querySelector("#withdrawForm #balance").value;

        const updateBalance = parseFloat(customer.balance) - parseFloat(withdrawCustomer.querySelector("#transactionAmount").value)
        data.balance = updateBalance

        if (data.transactionAmount < 10 || data.transactionAmount > 1000000000 || balanceCheck < data.transactionAmount) {
            console.log(data.transactionAmount);
            Swal.fire({
                title: 'Error',
                text: 'Tài khoản không đủ.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else if ((data.transactionAmount >= 10 || data.transactionAmount <= 1000000000 || data.transactionAmount > balanceCheck)) {

            data.dateTime = new Date()
            const afterTransaction = data.balance

            const timeDeposit = data.dateTime;
            const fullNameSender = document.querySelector("#withdrawForm #fullName").value;
            const beforeTransaction = document.querySelector("#withdrawForm #balance").value;
            const transactionAmountNumber = document.querySelector("#withdrawForm #transactionAmount").value;
            const response = await fetch(`http://localhost:3300/persons/${personId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await fetch(`http://localhost:3300/withdraw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timeDeposit, fullNameSender, beforeTransaction, afterTransaction, transactionAmountNumber }),
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Edited',
                    text: 'Trừ tiền thành công.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Trừ tiền thất bại.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}
const recipientData = {};
async function transferCustomer(personID) {
    const transferCustomer = document.getElementById("transferModal");
    transferCustomer.style.display = "block";
    const closeModalTransfer = document.getElementById("closeModalTransfer")
    closeModalTransfer.addEventListener('click', () => {
        transferCustomer.style.display = "none";
    })
    const customer = await findPersonById(personID);
    customer.transactionAmount = 0;
    customer.fees = 10;
    customer.transferAmount = 0;
    console.log(customer);
    const filesInputTransfer = transferCustomer.querySelectorAll(".form-control")
    filesInputTransfer.forEach((e) => {
        const fieldName = e.id;
        e.value = customer[fieldName]
    })
    const persons = await fetchAllPerson();
    const selectedPersons = persons.filter((person) => person.id !== personID);
    const select = document.getElementById('selectFullNameNotId'); // Tạo phần tử select
    selectedPersons.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.text = item.fullName;
        option.id = item.id
        select.appendChild(option);
    });
    const selectContainer = document.getElementById('selectContainer');
    selectContainer.appendChild(select);
    transferCustomer.addEventListener("submit", async function (e) {
        e.preventDefault();
        const inputFieldsEditNew = transferCustomer.querySelectorAll(".form-control");
        inputFieldsEditNew.forEach((input) => {
            const fieldName = input.id;
            const fieldValue = input.value;
            data[fieldName] = fieldValue;

        });
        const selectElement = document.getElementById('selectFullNameNotId');
        const selectedOptionValue = parseFloat(selectElement.value);
        inputFieldsEditNew.selectFullNameNotId = selectedOptionValue;
        data.transactionAmount = parseFloat(transferCustomer.querySelector("#transferAmount").value) + parseFloat(transferCustomer.querySelector("#transferAmount").value) * 10 / 100
        data.balance = (parseFloat(customer.balance) - data.transactionAmount);

        const customerNew = await findPersonById(selectedOptionValue)

        if (data.transferAmount < 10 || data.transferAmount > 1000000000) {
            Swal.fire({
                title: 'Error',
                text: 'Số tiền bạn nhập phải bé hơn 10 là hơn hơn 1.000.000.000.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else if (data.transactionAmount > customer.balance) {
            Swal.fire({
                title: 'Error',
                text: 'Số tiền trong tài khoản không đủ.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else {
            addBalance(customerNew.id, parseFloat(transferCustomer.querySelector("#transferAmount").value))
            data.dateTime = new Date()
            const timeTransfer = data.dateTime;
            const fullNameSender = document.querySelector("#transferForm #fullName").value;
            const transferNumber = document.querySelector("#transferForm #transferAmount").value;
            const feeNumber = document.querySelector("#transferForm #fees").value;
            const transactionAmountNumber = document.querySelector("#transferForm #transactionAmount").value;
            const selectFullNameNotIdFullName = customerNew.fullName
            console.log(selectFullNameNotIdFullName);
            const response = await fetch(`http://localhost:3300/persons/${personID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await fetch(`http://localhost:3300/transfer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timeTransfer, selectFullNameNotIdFullName, transactionAmountNumber, feeNumber, transferNumber, fullNameSender }),
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Edited',
                    text: 'Chuyển tiền thành công.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Chuyển tiền thất bại.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}
async function addBalance(id, amount) {
    const customer = await findPersonById(id);
    const newRecipientBalance = customer.balance + amount;
    const recipientData = {
        balance: newRecipientBalance
    };
    await fetch(`http://localhost:3300/persons/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(recipientData),
    });
}
function searchByName() {
    const searchInput = document.getElementById("searchName").value.toLowerCase();
    const rows = document.querySelectorAll("#tbCustomer tbody tr ");
    rows.forEach((row) => {
        const fullName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
        if (fullName.includes(searchInput)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
const sort = document.getElementById("balance");
let isAscendingSort = true;

sort.addEventListener("click", async () => {
    const bodyCustomer = document.querySelector("#tbCustomer tbody");
    const response = await fetch("http://localhost:3300/persons");
    const persons = await response.json();
    if (isAscendingSort) {
        persons.sort((a, b) => a.balance - b.balance);
        document.getElementById("sort-icon").classList.remove("desc");

    } else {
        persons.sort((a, b) => b.balance - a.balance);
        document.getElementById("sort-icon").classList.add("desc");

    }
    isAscendingSort = !isAscendingSort;
    bodyCustomer.innerHTML = "";
    persons.forEach((item) => {
        const str = renderPerson(item);
        bodyCustomer.innerHTML += str;
    });
});
const transferAmountInput = document.getElementById('transferAmount');
const feesInput = document.getElementById('fees');
const transferForm = document.getElementById('transferForm');

const transactionAmountInput = transferForm.querySelector('#transactionAmount');

transferAmountInput.addEventListener('input', updateTransactionAmount);

function updateTransactionAmount() {
    const transferAmount = parseFloat(transferAmountInput.value);
    const fees = 0.1 * transferAmount; // 10% fees
    const transactionAmount = transferAmount + fees;

    transactionAmountInput.value = transactionAmount.toFixed(2);
}



