import React, { useState } from 'react';
import type { User } from '../App';
import EditUserModal from './EditUserModal';

interface AdminTabProps {
    users: User[];
    currentUser: User;
    onAddUser: (user: Omit<User, 'id'>) => boolean;
    onUpdateUser: (user: User) => boolean;
    onDeleteUser: (id: number) => void;
}

const AdminTab: React.FC<AdminTabProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'cashier' | 'admin'>('cashier');

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && username && password) {
            const success = onAddUser({ name, username, password, role });
            if (success) {
                // Reset form
                setName('');
                setUsername('');
                setPassword('');
                setRole('cashier');
            }
        }
    };

    const handleSaveEdit = (updatedUser: User) => {
        const success = onUpdateUser(updatedUser);
        if (success) {
            setEditingUser(null);
        }
    };

    return (
        <>
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveEdit}
                />
            )}
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Add User Form */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Tambah Pengguna Baru</h2>
                    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl shadow-md space-y-4">
                        <div>
                            <label htmlFor="new-name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                            <input id="new-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="new-username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input id="new-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="new-password"className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="new-role" className="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
                            <select id="new-role" value={role} onChange={e => setRole(e.target.value as 'cashier' | 'admin')} className="w-full rounded-md border border-slate-300 p-2 shadow-sm bg-white text-slate-900">
                                <option value="cashier">Kasir</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            Simpan Pengguna
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Daftar Pengguna</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {users.map(user => (
                                <li key={user.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{user.name}</p>
                                        <p className="text-sm text-slate-500">{user.username}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                        <button onClick={() => setEditingUser(user)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                                        <button 
                                            onClick={() => onDeleteUser(user.id)} 
                                            disabled={currentUser.id === user.id}
                                            className="text-sm text-red-600 hover:text-red-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminTab;
