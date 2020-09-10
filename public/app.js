/**
 * Added number rows on table
 * @param  {Node[]} rows
 */
const addedRowsNumber = (rows) => {
    rows.forEach((row, id) => {
        row.querySelector('.row__number') ? row.querySelector('.row__number').textContent = `${ id + 1 }` : null;
    });
};

/** Add category item **/
const btnAddCategory = document.querySelector('.btn-add__category');
const errorCategory = document.querySelector('.error-category');
const rowTemplate = `<tr id="new" class="tbody__row">
                                        <td class="row__number"></td>
                                        <td>
                                            <form action="/admin/categories" method="POST" id="form-category" novalidate>
                                            <input class="input-edit__new-category" name="categories" type="text"
                                                   value="Test">
                                            </form>
                                        </td>
                                        <td class="td__btn">
                                             <button class="btn blue btn-save__new-category" type="submit" form="form-category"><i
                                                        class="far fa-save"></i></button>
                                        </td>
                                        <td class="td__btn">
                                             <button class="btn red btn-delete__new-category" data-id="new"><i class="fas fa-trash-alt"></i></button>
                                        </td>
                                    </tr>`;


btnAddCategory && btnAddCategory.addEventListener('click', (e) => {
    errorCategory ? errorCategory.remove() : null;
    const tableAppend = document.querySelector('.wrapper__table-category tbody');
    tableAppend.insertAdjacentHTML('beforeEnd', rowTemplate);

    const rows = tableAppend.querySelectorAll('tr');
    addedRowsNumber(rows);

    const rowNewCategory = document.querySelector('tbody #new');
    const btnDelete = rowNewCategory.querySelector('.btn-delete__new-category');

    btnDelete.addEventListener('click', (e) => {
        document.querySelector('#new').style.display = 'none';
    });
});

document.querySelectorAll('.wrapper__table-category tbody tr').forEach(row => {
    const input = row.querySelector('.edit__input-category');
    const btn = row.querySelector('.btn-edit__category');
    const btnSubmit = row.querySelector('.btn-submit__category');
    const editFormCategory = row.querySelector('.edit__form-category');

    btn && btn.addEventListener('click', (e) => {
        e.preventDefault();

        input.disabled = !input.disabled;
        btn.style.display = 'none';
        btnSubmit.style.display = 'inline-block';
    });

    editFormCategory && editFormCategory.addEventListener('submit', async (e) => {
        e.preventDefault();

        input.disabled = !input.disabled;
        btn.style.display = 'inline-block';
        btnSubmit.style.display = 'none';
        const formData = new FormData(editFormCategory);

        const data = {
            id: formData.get('id'),
            name: input.value
        };

        try {
            const result = await fetch('/admin/categories/edit', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const response = await result.json();
        } catch (e) {
            console.error('Error:', e);
        }
    });
});

const rows = document.querySelectorAll('tbody tr');
rows && addedRowsNumber(rows);

/** Create post **/
(window.location.pathname === '/admin/articles/add' || window.location.search === '?allow=true') && ClassicEditor
    .create(document.querySelector('#editor'), {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                //'fontFamily',
                //'fontSize',
                //'fontColor',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'indent',
                'outdent',
                '|',
                // 'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                //'code',
                //'codeBlock',
                'undo',
                'redo'
            ]
        },
        language: 'en',
        // image: {
        //     toolbar: [
        //         'imageTextAlternative',
        //         'imageStyle:full',
        //         'imageStyle:side'
        //     ]
        // },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
                //'tableCellProperties',
                //'tableProperties'
            ]
        },
        licenseKey: '',
        sidebar: {
            container: document.querySelector('.sidebar')
        }
    })
    .then(editor => {
        window.editor = editor;
    })
    .catch(error => {
        console.error('Oops, something gone wrong!');
        console.error(error);
    });

let bannerImg = '';
let cropper;
const image = document.getElementById('image');
const previewImage = document.getElementById('result');
const inputFile = document.getElementById('img');
const downloadButton = document.querySelector('.download-button');
const btnDisabled = document.querySelector('.save-btn');
const params = new URLSearchParams(window.location.search);
let isCropped = false;

downloadButton && downloadButton.addEventListener('click', function (e) {
    if (inputFile) {
        inputFile.click();
    }
    e.preventDefault();
});

/**
 * For update post
 * */
if (image && image.getAttribute('src')) {
    bannerImg = image.getAttribute('src');
    cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        autoCrop: false,
        crop(event) {
            crop(cropper);
        }
    });
}

const setImgUrl = (url) => {
    image.setAttribute('src', url);
};

const crop = (cropper) => {
    let bounce = setTimeout(() => {
        setImgUrl(cropper.getCroppedCanvas().toDataURL());
        bannerImg = cropper.getCroppedCanvas().toDataURL();
        previewImage.setAttribute('src', bannerImg);
        isCropped = true;
        btnDisabled && btnDisabled.removeAttribute('disabled');
        clearTimeout(bounce);
    }, 500);
};

const readFile = (file) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', (event) => {
        const result = event.target.result;
        setImgUrl(result);
        cropper = new Cropper(image, {
            aspectRatio: 16 / 9,
            autoCrop: false,
            crop(event) {
                crop(cropper);
            }
        });
    });

    reader.addEventListener('progress', (event) => {
        if (event.loaded && event.total) {
            const percent = (event.loaded / event.total) * 100;
            console.log(`Progress: ${ Math.round(percent) }`);
        }
    });
};

inputFile && inputFile.addEventListener('change', (e) => {
    if (cropper) {
        cropper.destroy();
    }
    let target = e.target || e.srcElement || e.currentTarget;
    let file = target.files[0];
    readFile(file);
});

const form = document.forms['articles'];
let newData = {};
if (params.has('allow')) {

    Array.from(form.elements).forEach(el => {
        el.addEventListener('input', (e) => {
            e.preventDefault();
            newData[`${ el.name }`] = el.value;
        });
    });
}

try {
    form && form.addEventListener('submit', async (e) => {
        const categorySelectValue = document.querySelector('.select-dropdown');
        e.preventDefault();

        if (params.has('allow')) {
            let data = {
                ...newData,
                id: form.elements.id.value,
                img: isCropped ? bannerImg : '',
                categories: categorySelectValue.value,
                body: form.elements.body.value
            };

            /** If not updated category **/
            if (!data.categories) {
                delete data.categories;
            }

            /** If not updated image **/
            if (!isCropped) {
                delete data.img;
            }

            const response = await fetch('/admin/articles/edit', {
                method: 'PUT',
                headers: {
                    //'Content-Type': 'application/octet-stream',
                    'Content-Type': 'application/json'
                    //'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result) {
                isCropped = false;
                window.location.href = `${ window.location.origin }/admin/articles`;
            }
        } else {
            let data = {
                title: form.elements.title.value,
                description: form.elements.description.value,
                categories: categorySelectValue.value,
                metatitle: form.elements.metatitle.value,
                metakeywords: form.elements.metakeywords.value,
                metadescription: form.elements.metadescription.value,
                img: bannerImg,
                body: form.elements.body.value
            };
            const response = await fetch('/admin/articles/add', {
                method: 'POST',
                //mode: 'cors', // no-cors, *cors, same-origin
                //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                //credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    //'Content-Type': 'application/octet-stream'
                    'Content-Type': 'application/json'
                    //'Content-Type': 'application/x-www-form-urlencoded',
                },
                //redirect: 'follow', // manual, *follow, error
                //referrerPolicy: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result) {
                isCropped = false;
                window.location.href = `${ window.location.origin }/admin/articles`;
            }
        }

    });
} catch (e) {
    console.log(e);
}

/** Publish post **/
const btnPublish = document.querySelectorAll('.publish');
btnPublish.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        console.log("formData", formData);

        const data = {
            id: formData.get('id'),
            status: formData.get('status')
        };
        console.log('DATA', data);
        try {
            const result = await fetch('/admin/articles/publish', {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(result.status === 200) {
                console.log("result.status", result);
                const response = await result.json();
                const btn = form.querySelector('button');
                console.log('btn', btn);
                btn.classList.remove(`${response.status ? 'red' : 'green'}`);
                btn.classList.add(`${response.status ? 'green' : 'red'}`);
                btn.innerHTML = `${response.status ? 'Published' : 'Unpublished'}`;
                console.log("response", response);
            }

        } catch (e) {
            console.error('Error:', e);
        }
    });
})

/** Init elements **/
M.Tooltip.init(document.querySelectorAll('.tooltipped'));
M.FormSelect.init(document.querySelectorAll('select'));
M.Tabs.init(document.querySelectorAll('.tabs'));

