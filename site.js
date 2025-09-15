window.addEventListener("load", function () {

    let buttons = document.querySelectorAll("button");
    for (let btn of buttons) {
        btn.addEventListener("click", function () {
            btn.nextElementSibling.innerHTML = "İşlem gerçekleştiriliyor, lütfen bekleyiniz...";
        });
    }

    let filterInputs = document.querySelectorAll('.tblfilter');
    filterInputs.forEach(input => {
        input.addEventListener('input', function () {
            let table = input.nextElementSibling;
            let filterText = this.value.toLowerCase();
            let rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                let cells = row.getElementsByTagName('td');
                let rowText = '';

                for (let j = 0; j < cells.length; j++) {
                    rowText += cells[j].textContent.toLowerCase() + ' ';
                }

                if (rowText.includes(filterText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });
});

function toggleText(element) {
    let truncated = element.parentElement.firstChild;
    let full = truncated.nextElementSibling;
    if (truncated.style.display == "none") {
        truncated.style.display = "inline-block";
        full.style.display = "none";
    }
    else {
        truncated.style.display = "none";
        full.style.display = "inline-block";
    }
}