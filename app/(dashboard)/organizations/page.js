'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import OrganizationFormModal from '@/components/organizations/OrganizationFormModal';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояние модального окна
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchData = async () => {
    try {
      const [orgRes, userRes] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/users'),
      ]);
      const orgData = await orgRes.json();
      const userData = await userRes.json();

      setOrganizations(Array.isArray(orgData) ? orgData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [orgRes, userRes] = await Promise.all([
          fetch('/api/organizations'),
          fetch('/api/users'),
        ]);
        const orgData = await orgRes.json();
        const userData = await userRes.json();

        if (!ignore) {
          setOrganizations(Array.isArray(orgData) ? orgData : []);
          setUsers(Array.isArray(userData) ? userData : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingOrg(null);
    setTitle('');
    setSelectedUsers([]);
    setIsOpen(true);
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setTitle(org.title);
    setSelectedUsers(org.allowedUsers.map((u) => u._id || u));
    setIsOpen(true);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const method = editingOrg ? 'PUT' : 'POST';
    const url = editingOrg
      ? `/api/organizations/${editingOrg._id}`
      : '/api/organizations';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, allowedUsers: selectedUsers }),
    });

    if (res.ok) {
      setIsOpen(false);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const res = await fetch(`/api/organizations/${deleteConfirmId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setDeleteConfirmId(null);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Организации</h1>
          <p className="text-sm text-slate-500">
            Учет обслуживаемых компаний и назначение доступов сотрудникам
          </p>
        </div>
        <Button onClick={openCreateModal}>+ Добавить организацию</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Загрузка данных...
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Список организаций пуст
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Название</th>
                  <th className="px-6 py-4">Доступные сотрудники</th>
                  <th className="px-6 py-4">Дата добавления</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {organizations.map((org) => (
                  <tr
                    key={org._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {org.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {org.allowedUsers?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {org.allowedUsers.map((u) => (
                            <span
                              key={u._id}
                              className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200"
                            >
                              {u.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Всем (или не назначены)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(org.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(org)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(org._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrganizationFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        title={title}
        setTitle={setTitle}
        users={users}
        selectedUsers={selectedUsers}
        toggleUserSelection={toggleUserSelection}
        isEditing={!!editingOrg}
      />

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Удалить организацию?"
        message="Это действие нельзя будет отменить. Заявки, привязанные к этой компании, могут потерять связь."
      />
    </div>
  );
}
