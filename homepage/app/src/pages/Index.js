// Index.js

import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';
import config from "../config";
import '../index.css';
import MyModal from "../components/MyModal";
import dayjs from 'dayjs';

function Index() {
    const [products, setProducts] = useState([]);
    const [carts, setCarts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [randomProduct, setRandomProduct] = useState(null);
    const [randomNumber, setRandomNumber] = useState("");
    const [animationKey, setAnimationKey] = useState(0); // Key to trigger re-render
    const [recordInCarts, setRecordInCarts] = useState(0);
    const [sumQty, setSumQty] = useState(0);
    const [sumPrice, setSumPrice] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [payDate, setPayDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
    const [payTime, setPayTime] = useState('');
    const [cartAnimation, setCartAnimation] = useState(false);




    useEffect(() => {
        fetchData();
        fetchDataFromLocal();
    }, []);

    const handleSave = async () => {
        try {
            const payload = {
                customerName: customerName,
                customerPhone: customerPhone,
                payDate: payDate,
                payTime: payTime,
                carts: carts
            }

            const res = await axios.post(config.apiPath + '/api/sale/save', payload);

            if (res.data.message === 'success') {
                localStorage.removeItem('carts');
                setRecordInCarts(0);
                setCarts([]);

                Swal.fire({
                    title: 'บันทึกข้อมูล',
                    text: 'ระบบได้บันทึกข้อมูลของคุณแล้ว',
                    icon: 'success'
                })

                document.getElementById('modalCart_btnClose').click();
                setCustomerName('');
                setCustomerName('');
                setPayDate(new Date());
                setPayTime('');
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            });
        }
    }

    const handleRemove = async (item) => {
        try {
            const button = await Swal.fire({
                title: 'ลบสินค้า',
                text: 'คุณต้องการลบสินค้าออกจากตะกร้าใช่หรือไม่',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true,
            })

            if (button.isConfirmed) {
                let arr = carts;

                for (let i = 0; i < arr.length; i++) {
                    const itemIncarts = arr[i];

                    if (item.id === itemIncarts.id) {
                        arr.splice(i, 1);
                    }
                }
                setCarts(arr);
                setRecordInCarts(arr.length);

                localStorage.setItem('carts', JSON.stringify(arr));

                computePriceAndQty(arr);
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const handleCloseModal = () => {
        document.getElementById('modalCart_btnClose').click();
    }

    const computePriceAndQty = (itemIncarts) => {
        let sumQty = 0;
        let sumPrice = 0;

        for (let i = 0; i < itemIncarts.length; i++) {
            const item = itemIncarts[i];
            sumQty++;
            sumPrice += parseInt(item.price);
        }

        setSumPrice(sumPrice);
        setSumQty(sumQty);
    }

    const fetchData = async () => {
        try {
            const res = await axios.get(config.apiPath + '/product/list');
            if (res.data.results !== undefined) {
                setProducts(res.data.results);
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            });
        }
    };

    const fetchDataFromLocal = () => {
        const itemIncarts = JSON.parse(localStorage.getItem('carts'));

        if (itemIncarts !== null) {
            setCarts(itemIncarts);
            setRecordInCarts(itemIncarts !== null ? itemIncarts.length : 0);

            computePriceAndQty(itemIncarts);
        }

    };


    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

    };


    const handleRandomProduct = () => {
        const randomIndex = Math.floor(Math.random() * products.length);
        const randomProduct = products[randomIndex];
        setRandomNumber(randomProduct.name);
        setRandomProduct(randomProduct);
        setSearchTerm(randomProduct.name);
        setAnimationKey(prevKey => prevKey + 1); // Trigger re-render for animation
    };

    const handleClearRandom = () => {
        setRandomNumber("");
        setRandomProduct(null);
        setSearchTerm(""); // เคลียร์ค่าในช่องค้นหาหมายเลขด้วย
    };

    const addToCart = (item) => {
        let arr = carts;

        if (arr === null) {
            arr = [];
        }

        arr.push(item);

        setCarts(arr)
        setRecordInCarts(arr.length);

        localStorage.setItem('carts', JSON.stringify(carts));

        fetchDataFromLocal();

        // Trigger cart icon animation
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), 1000); // Animation duration

    };

    const filteredProducts = products.filter(item => item.name.includes(searchTerm));

    function showImage(item) {
        if (item.img !== undefined) {
            let imgPath = "default-image.jpg";
            if (item.img) {
                imgPath = config.apiPath + '/uploads/' + item.img;
            }
            return <img className="card-img-top" height='auto' src={imgPath} alt="" />;
        }
        return <></>;
    }


    return (
        <>
            <div className="container mt-3">
                <div className="promo-image">
                    <img src="/uploads/1.jpg" alt="" className="img-fluidlogo mb-5" />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="h3">
                        <button type="button" className="btn animated-button">มาแรง !</button> สินค้าแนะนำ
                    </div>
                    <div>
                        ตะกร้าของฉัน
                        <button
                            data-bs-toggle='modal'
                            data-bs-target='#modalCart'
                            className={`btn btn-warning ms-2 me-2 ${cartAnimation ? 'cart-animate' : ''}`}>
                            <i className="fa fa-shopping-cart me-2"></i>
                            {recordInCarts}
                        </button>
                        ชิ้น
                    </div>

                </div>
                <div className="row mb-1">
                    <div className="col-12 d-flex justify-content-between">
                        <input type="text" className="form-control" placeholder="ค้นหาตัวเลข...กรอกเฉพาะตัวเลขเท่านั้น!!" value={searchTerm} onChange={handleSearchChange} />
                        <div className="ms-3 p-1">
                            <button className="btn btn-danger  " onClick={handleRandomProduct}>สุ่มตัวเลข</button>
                        </div>
                        <div className="mt-1">
                            <button className="btn btn-warning ms-2" onClick={handleClearRandom}>
                                <i className="fa fa-undo"></i> รีเฟรช
                            </button>
                        </div>
                    </div>
                    <div className="random-number-display mt-3 text-center  w-100" key={animationKey}>
                        {randomNumber && [...randomNumber].map((num, index) => (
                            <span key={index} className="random-number" style={{ animationDelay: `${index * 0.1}s` }}>{num}</span>
                        ))}
                    </div>
                </div>
                <div className="row">
                    {randomProduct && (
                        <div className="col-12">
                            <div className="card mt-4 animated-card">
                                {showImage(randomProduct)}
                                <div className="card-body bg- text-body-emphasis">
                                    <div className="mb-2">{randomProduct.name}</div>
                                    <div>ราคา = {randomProduct.price} บาท</div>
                                    <div className="text-center">
                                        <button className="btn btn-primary mt-4">
                                            <i className="fa fa-shopping-cart mr-2"></i>Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {filteredProducts.length > 0 ? filteredProducts.map(item =>
                        <div className="col-12 col-sm-6 col-md-4 mt-3" key={item.id}>
                            <div className="card mt-4 animated-card">
                                {showImage(item)}
                                <div className="card-body bg- text-body-emphasis">
                                    <div className="mb-2">{item.name}</div>
                                    <div>ราคา = {item.price.toLocaleString('th-TH')}บาท</div>
                                    <div className="text-center">
                                        <button className="btn btn-primary mt-4" onClick={e => addToCart(item)}>
                                            <i className="fa fa-shopping-cart mr-2"></i>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : <div className="col-12"><p>ไม่พบสินค้าที่ตรงกับการค้นหา</p></div>}
                </div>
            </div>
            {/* line-button */}
            <a href="https://lin.ee/bmHvXwP" className="line-button" target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Icon" className="line-icon" />
            </a>

            <MyModal id='modalCart' title='ตะกร้าสินค้าของฉัน' className='modal-header' >
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>รายการ</th>
                            <th className="text-end">ราคา</th>
                            <th className="text-end">จำนวน</th>
                            <th className="text-center" width='60px'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {carts.length > 0 ? carts.map(item =>
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-end">{item.price.toLocaleString('th-TH')}</td>
                                <td className="text-end">1</td>
                                <td className="text-center">
                                    <button className="btn btn-danger" onClick={e => handleRemove(item)}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        ) : <tr><td colSpan="4" className="text-center">ไม่มีสินค้าในตะกร้า</td></tr>}
                    </tbody>
                </table>

                <div className="text-center ">
                    จำนวน {sumQty} รายการ เป็นเงิน {sumPrice} บาท
                </div>

                <div className="mt-3">
                    <div className="alert alert-info ">
                        <div>โปรดโอนเงินไปยังบัญชี</div>
                        <div>กรุงไทย : ขวานฟ้าลอตเตอรี่  757-115-95965
                            หากเป็นบัญชีนอกจากที่แจ้ง คือ บัญชีแอบอ้าง หรือ มิจฉาชีพ
                            โปรดระวัง!! </div>
                    </div>
                    {/* <div className=" alert alert-info me-3 p-2">สแกนเพื่อจ่าย
                        <img className="QrCode " height='100px' src="/uploads/qr.png" alt="QR Code" />
                    </div> */}
                    <div className="mt-3">
                        <div>ชื่อผู้ซื้อ</div>
                        <input className="form-control" placeholder="โปรดกรอกให้ตรงกับชื่อจริง"
                            onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="mt-3">
                        <div>เบอร์โทรติดต่อ</div>
                        <input className="form-control" placeholder="โปรดกรอกให้ตรงกับเวลาเบอร์ติดต่อจริง"
                            onChange={e => setCustomerPhone(e.target.value)} />
                    </div>
                    <div className="mt-3">
                        <div>วันที่โอน</div>
                        <input className="form-control" type="date"
                            value={payDate} onChange={e => setPayDate(e.target.value)} />
                    </div>
                    <div className="mt-3">
                        <div>เวลาที่โอน</div>
                        <input className="form-control" placeholder="โปรดกรอกให้ตรงกับเวลาโอนจริง"
                            onChange={e => setPayTime(e.target.value)} />
                    </div>
                    <button className="btn btn-primary mt-3" onClick={handleSave}>
                        <i className="fa fa-check me-2"></i>ยืนยันการซื้อ
                    </button>
                    <button className="btn btn-secondary mt-3 ms-2 me-2" onClick={handleCloseModal}>
                        <i className="fa fa-check me-2"></i>ยกเลิก
                    </button>
                </div>
            </MyModal>

        </>
    );
}

export default Index;
