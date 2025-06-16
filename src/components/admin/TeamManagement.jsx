import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Users } from 'lucide-react';
import { useBattle } from '../../contexts/BattleContext';

const TeamManagement = () => {
  const { teams, addTeam, updateTeam, deleteTeam } = useBattle();
  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', color: '#dc2626' });
  const [showAddForm, setShowAddForm] = useState(false);

  const colors = [
    { name: '빨강', value: '#dc2626', bg: 'bg-red-600' },
    { name: '파랑', value: '#2563eb', bg: 'bg-blue-600' },
    { name: '초록', value: '#059669', bg: 'bg-green-600' },
    { name: '보라', value: '#7c3aed', bg: 'bg-purple-600' },
    { name: '주황', value: '#ea580c', bg: 'bg-orange-600' },
    { name: '분홍', value: '#db2777', bg: 'bg-pink-600' },
    { name: '청록', value: '#0891b2', bg: 'bg-cyan-600' },
    { name: '노랑', value: '#ca8a04', bg: 'bg-yellow-600' },
  ];

  const handleAddTeam = () => {
    if (newTeam.name.trim()) {
      addTeam(newTeam);
      setNewTeam({ name: '', color: '#dc2626' });
      setShowAddForm(false);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
  };

  const handleSaveEdit = () => {
    if (editingTeam.name.trim()) {
      updateTeam(editingTeam.id, editingTeam);
      setEditingTeam(null);
    }
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm('정말로 이 팀을 삭제하시겠습니까?')) {
      deleteTeam(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
  };

  const handleCancelAdd = () => {
    setNewTeam({ name: '', color: '#dc2626' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            팀 관리
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            팀 추가
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* 팀 추가 폼 */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4">새 팀 추가</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 이름
                </label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="팀 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 색상
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
                        newTeam.color === color.value ? 'border-gray-900' : 'border-gray-300'
                      } hover:scale-110 transition-transform`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTeam}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 팀 목록 */}
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              {editingTeam && editingTeam.id === team.id ? (
                // 편집 모드
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      팀 이름
                    </label>
                    <input
                      type="text"
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      팀 색상
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setEditingTeam({ ...editingTeam, color: color.value })}
                          className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
                            editingTeam.color === color.value ? 'border-gray-900' : 'border-gray-300'
                          } hover:scale-110 transition-transform`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: team.color }}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">멤버 {team.members}명</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">등록된 팀이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">팀 추가 버튼을 클릭하여 새 팀을 만들어보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;