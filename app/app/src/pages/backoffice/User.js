import BackOffice from "../../components/BackOffice";
import axios from "axios";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import MyModal from "../../components/MyModal";
import config from "../../config";


function User() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(config.apiPath + '/user/list');
            if (res.data.results !== undefined) {
                setUsers(res.data.results);
                setFilteredUsers(res.data.results); // ตั้งค่า filteredUsers เท่ากับ users ที่ดึงมา
            }
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.message,
                icon: "error",
            });
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const res = await axios.put(config.apiPath + '/user/update/' + selectedUser.id, selectedUser);
            if (res.data.message === "success") {
                Swal.fire({
                    title: "Success",
                    text: "User updated successfully",
                    icon: "success",
                });
                setIsEditing(false);
                fetchUsers();
            }
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.message,
                icon: "error",
            });
        }
    };

    const handleDelete = async (userId) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                const res = await axios.delete(config.apiPath + '/user/remove/' + userId);
                if (res.data.message === "success") {
                    Swal.fire("Deleted!", "User has been deleted.", "success");
                    fetchUsers();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value === "") {
            setFilteredUsers(users); // ถ้าไม่มี query แสดงผู้ใช้ทั้งหมด
        } else {
            setFilteredUsers(users.filter(user => user.name.toLowerCase().includes(e.target.value.toLowerCase())));
        }
    };


    return <BackOffice>
        <div className="container mt-3">
            <h3>จัดการผู้ใช้งาน</h3>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาผู้ใช้"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <button className="btn btn-outline-secondary" type="button">
                    ค้นหา
                </button>
            </div>
            <table className="table table-bordered table-hover mt-3">
                <thead className="bg-success">
                    <tr>
                        <th>ชื่อผู้ใช้</th>
                        <th>อีเมล์</th>
                        <th>บทบาท</th>
                        <th width='140px'>การกระทำ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td className="text-center" width='140px'>
                                <button
                                    className="btn btn-primary mr-2"
                                    onClick={() => handleEdit(user)}
                                    data-toggle="modal"
                                    data-target="#editUserModal"
                                >
                                    แก้ไข
                                </button>
                                <button
                                    className="btn btn-danger me-2"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    ลบ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isEditing && (
                <MyModal id="editUserModal" title="แก้ไขผู้ใช้งาน">
                    <div className="mb-3">
                        <label className="form-label">ชื่อผู้ใช้</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={selectedUser.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">อีเมล์</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={selectedUser.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">บทบาท</label>
                        <select
                            className="form-control"
                            name="role"
                            value={selectedUser.role}
                            onChange={handleChange}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => setIsEditing(false)}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            บันทึก
                        </button>
                    </div>
                </MyModal>
            )}
        </div>
    </BackOffice>
}

export default User;