import React, { useState, useEffect } from 'react';
import type { User } from '../App';

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState(''); // Keep password blank for security
    const [role, setRole] = useState(user.role);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser = {
            ...user,
            name,
            username,
            role,
            // Only update password if a new one is entered
            password: password ? password : user.password,
        };
        onSave(updatedUser);
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-slate-800">Edit Pengguna</h3>
                        <p className="text-sm text-slate-500">Mengubah detail untuk {user.name}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                            <input id="edit-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="edit-username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input id="edit-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="edit-password"className="block text-sm font-medium text-slate-700 mb-1">Password Baru (Opsional)</label>
                            <input id="edit-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" placeholder="Biarkan kosong jika tidak berubah" />
                        </div>
                        <div>
                            <label htmlFor="edit-role" className="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
                            <select id="edit-role" value={role} onChange={e => setRole(e.target.value as 'cashier' | 'admin')} className="w-full rounded-md border border-slate-300 p-2 shadow-sm bg-white text-slate-900">
                                <option value="cashier">Kasir</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold">Batal</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
