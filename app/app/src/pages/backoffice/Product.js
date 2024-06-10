import { useEffect, useRef, useState } from "react";
import BackOffice from "../../components/BackOffice";
import MyModal from "../../components/MyModal";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../../config";
import '../../Product.css';



function showImage(item) {
    if (item.img !== "") {
        return <img alt='' className="img-fluid" src={config.apiPath + '/uploads/' + item.img} />
    }

    return <> </>;
}

function Product() {
    const [product, setProduct] = useState({ name: 'หมายเลข :' });
    //CREATE , UPDATE
    const [products, setProducts] = useState([]);
    const [productTrash, setProductTrash] = useState({}); //SHOW
    const [img, setImg] = useState(null); // file for update 
    const [imagePreview, setImagePreview] = useState(null);
    const [fileExcel, setFileExcel] = useState({});
    const [selectedTrashItems, setSelectedTrashItems] = useState([]);
    const refImg = useRef();
    const refExcel = useRef();
    const alertError = (error) => {
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        })
    }

    useEffect(() => {
        fetchData();
        fetchDataTrash();
    }, []);

    const handleTrashCheckboxChange = (itemId) => {
        setSelectedTrashItems(prevSelected => {
            if (prevSelected.includes(itemId)) {
                return prevSelected.filter(id => id !== itemId);
            } else {
                return [...prevSelected, itemId];
            }
        });
    };

    const handleRestore = (item) => {
        Swal.fire({
            text: 'Restore item',
            title: 'restore',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        }).then(async (res) => {
            if (res.isConfirmed) {
                if (selectedTrashItems.length === 0) {
                    await axios.put(config.apiPath + '/product/restore/' + item.id, config.headers())
                        .then((res) => {
                            if (res.data.message === "success") {
                                Swal.fire({
                                    title: 'restore',
                                    text: 'success',
                                    icon: 'success',
                                    timer: 1000
                                })
                                fetchData();
                                fetchDataTrash();
                            }
                        })
                } else {
                    for (const itemId of selectedTrashItems) {
                        const res = await axios.put(config.apiPath + '/product/restore/' + itemId, config.headers())
                        if (res.data.message === "success") {
                            Swal.fire({
                                title: "Restore",
                                text: ' Item has been restore successfully',
                                icon: "success",
                                timer: 1000
                            })
                        }
                    }
                    fetchData();
                    fetchDataTrash();
                }
            }
        }).catch(e => alertError(e))
    }
    const handleUpload = async () => {
        try {
            const formData = new FormData();
            if (img) {
                formData.append('img', img);
            } else {
                throw new Error('No file selected');
            }

            const res = await axios.post(config.apiPath + '/product/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token')
                }
            });
            if (res.data.newName !== undefined) {
                return res.data.newName;
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            });
            return "";
        }
    }

    const handleSave = async () => {
        try {
            product.img = await handleUpload();
            product.price = parseInt(product.price);
            product.cost = parseInt(product.cost);


            let res;

            if (product.id === undefined) {
                res = await axios.post(config.apiPath + '/product/create', product, config.headers());
            } else {
                res = await axios.put(config.apiPath + '/product/update', product, config.headers());
            }
            if (res.data.message === 'success') {
                Swal.fire({
                    title: 'save',
                    text: 'success',
                    icon: "success",
                    timer: 500 //1000 = 1 วิ
                })
                document.getElementById('modalProduct_btnClose').click();
                fetchData();

                setProduct({ ...product, id: undefined }); //Clear id
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const fetchData = async () => {
        try {
            const res = await axios.get(config.apiPath + '/product/list', config.headers());

            if (res.data.results !== undefined) {
                setProducts(res.data.results);
            }

        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const fetchDataTrash = async () => {
        try {
            const res = await axios.get(config.apiPath + '/product/listTrash', config.headers());

            if (res.data.results !== undefined) {
                setProductTrash(res.data.results);
            }

        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const clearForm = () => {
        setProduct({
            name: 'หมายเลข :', // ตั้งค่าเริ่มต้นใหม่
            price: '',
            cost: ''
        })
        setImg(null);
        refImg.current.value = '';
        setImagePreview(null);
    }


    const handleRemove = async (item) => {
        try {
            const button = await Swal.fire({
                text: 'remove item',
                title: 'remove',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                const res = await axios.delete(config.apiPath + '/product/remove/' + item.id, config.headers());

                if (res.data.message === 'success') {
                    Swal.fire({
                        title: 'remove',
                        text: 'remove success',
                        icon: 'success',
                        timer: 1000
                    })

                    fetchData();
                    fetchDataTrash();
                }
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const selectedFile = (files) => {
        if (files && files.length > 0) {
            const file = files[0];
            setImg(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            Swal.fire({
                title: 'Error',
                text: 'No file selected',
                icon: 'error'
            });
        }
    };

    const selectedFileExcel = (fileInput) => {
        if (fileInput !== undefined) {
            if (fileInput.length > 0) {
                setFileExcel(fileInput[0]);
            }
        }
    }

    const handleUploadExcel = async () => {
        try {
            const formData = new FormData();
            formData.append('fileExcel', fileExcel);

            const res = await axios.post(config.apiPath + '/product/uploadFromExcel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token')
                }
            });

            if (res.data.message === 'success') {
                Swal.fire({
                    title: 'upload file',
                    text: 'upload success',
                    icon: 'success',
                    timer: 1000
                });

                fetchData();

                document.getElementById('modalExcel_btnClose').click();
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const clearFormExcel = () => {
        refExcel.current.value = '';
        setFileExcel(null);
    }

    const handleRemoveReal = async (item) => {
        try {
            const button = await Swal.fire({
                title: "Permanent Delete",
                text: "Are you sure you want to permanently delete this item?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
            });

            if (button.isConfirmed) {
                if (selectedTrashItems.length === 0) {
                    const res = await axios.delete(config.apiPath + '/product/removeReal/' + item.id, config.headers());

                    if (res.data.message === "success") {
                        Swal.fire({
                            title: "ลบสำเร็จ",
                            text: "ลบสินค้าเรียบร้อย",
                            icon: "success",
                            timer: 1000,
                        });

                        fetchDataTrash();
                    }
                } else {
                    for (const itemId of selectedTrashItems) {
                        const res = await axios.delete(config.apiPath + '/product/removeReal/' + itemId, config.headers());

                        if (res.data.message === "success") {
                            Swal.fire({
                                title: "ลบสำเร็จ",
                                text: "ลบสินค้าเรียบร้อย",
                                icon: "success",
                                timer: 1000,
                            });

                            fetchDataTrash();
                        }
                    }
                }
            }
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.message,
                icon: "error",
            });
        }
    };

    const handleConfirmTrashAction = () => {
        document.getElementById("modalTrash_btnClose").click();
    }

    return (
        <BackOffice>
            <div className="h2">Product</div>
            <button onClick={clearForm} className="btn btn-outline-primary mr-2" data-toggle='modal' data-target='#modalProduct'>
                <i className="fa fa-plus mr-2 " ></i> เพิ่มรายการสินค้า
            </button>

            <button onClick={clearFormExcel} className=" btn btn-outline-success " data-toggle='modal' data-target='#modalExcel' >
                <i className="fas fa-file-excel  mr-3"></i>import from Excel
            </button>

            <button className="btn btn-outline-warning ml-2 float-center" data-toggle='modal' data-target='#modalTrash'>
                <i className="fa fa-trash mr-2" aria-hidden="true"></i>
                Trash ({productTrash.length})
            </button>

            <table className="mt-3 table table-bordered table-hover ">
                <thead className="bg-success">
                    <tr>
                        <th width='300px'>ภาพสินค้า</th>
                        <th>name</th>
                        <th width='150px' className="text-right">cost</th>
                        <th width='150px' className="text-right">price</th>
                        <th width='140px'></th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? products.map(item =>
                        <tr key={item.id}>
                            <td>{showImage(item)}</td>
                            <td>{item.name}</td>
                            <td className="text-right">{item.cost}</td>
                            <td className="text-right">{item.price}</td>
                            <td className="text-center">
                                <button className="btn btn-primary mr-2"
                                    data-toggle='modal'
                                    data-target='#modalProduct'
                                    onClick={e => setProduct(item)}>
                                    <i className="fa fa-edit"></i>
                                </button>
                                <button className="btn btn-danger" onClick={e => handleRemove(item)}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    ) : <></>}
                </tbody>
            </table>

            <MyModal id='modalProduct' title='สินค้า'>
                <div className="mt-3">
                    <div>ชื่อสินค้า</div>
                    <input value={product.name} className="form-control"
                        type="tel"
                        placeholder="ลอตเตอรี่ เบอร์ :"
                        pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                        onChange={e => setProduct({ ...product, name: e.target.value })} />
                </div>
                <div className="mt-3">
                    <div>ราคาทุน</div>
                    <input value={product.cost} className="form-control" onChange={e => setProduct({ ...product, cost: e.target.value })} />
                </div>
                <div className="mt-3">
                    <div>ราคาขาย</div>
                    <input value={product.price} className="form-control" onChange={e => setProduct({ ...product, price: e.target.value })} />
                </div>
                <div className="mt-12 ">
                    <div className="mb-3">
                        {imagePreview ? (
                            <img
                                alt=""
                                className="img-fluid2"
                                width="400px"
                                src={imagePreview}
                            />
                        ) : (
                            showImage(product)
                        )}</div>
                    <div>ภาพสินค้า</div>
                    <input className="form-control p-1" type="file" ref={refImg} onChange={e => selectedFile(e.target.files)} />
                </div >
                <div className="mt-3">
                    <button className="btn btn-primary" onClick={handleSave}>
                        <i className="fa fa-check mr-2"> Save</i>
                    </button>
                </div>
            </MyModal>

            <MyModal id='modalExcel' title='เลือกไฟล์'>
                <div>เลือกไฟล์</div>
                <input className="p-1 form-control" type="file" ref={refExcel} onChange={e => selectedFileExcel(e.target.files)} />

                <button className="mt-3 btn btn-primary" onClick={handleUploadExcel}>
                    <i className="fa fa-check mr-2"></i>Save
                </button>
            </MyModal>

            <MyModal id='modalTrash' title='Trash'>
                <table className="mt-3 table table-borderd table-striped ">
                    <thead className="thead-light">
                        <tr>
                            <th width="20px">
                                <input type="checkbox" checked={selectedTrashItems.length === productTrash.length} onChange={() => {
                                    setSelectedTrashItems(selectedTrashItems.length === productTrash.length ? [] : productTrash.map(item => item.id))
                                }} />
                            </th>
                            <th width='200px'>Picture</th>
                            <th>name</th>
                            <th width='150px' className="text-right">cost</th>
                            <th width='150px' className="text-right">price</th>
                            <th width='140px'>Restore</th>
                            <th width='140px'>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productTrash.length > 0 ? productTrash.map(item =>
                            <tr key={item.id}>
                                <td>
                                    <input type="checkbox"
                                        checked={selectedTrashItems.includes(item.id)}
                                        onChange={() => handleTrashCheckboxChange(item.id)}
                                    />
                                </td>
                                <td>{showImage(item)}</td>
                                <td>{item.name}</td>
                                <td className="text-right">{item.cost}</td>
                                <td className="text-right">{item.price}</td>
                                <td className="text-center">
                                    <button className="btn btn-success" disabled={selectedTrashItems.length === 0} onClick={e => handleRestore(item)}>
                                        <i className="fa fa-undo"></i>
                                    </button>

                                </td>
                                <td className="text-center">
                                    <button className="btn btn-danger" disabled={selectedTrashItems.length === 0} onClick={e => handleRemoveReal(item)}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        ) : <></>}
                    </tbody>
                </table>
                <div className="d-flex justify-content-left mt-3">
                    <button className="btn btn-success" onClick={handleConfirmTrashAction}>
                        <i className="fa fa-check"></i> ยืนยัน
                    </button>
                </div>
            </MyModal>

        </BackOffice>
    );
}

export default Product;
