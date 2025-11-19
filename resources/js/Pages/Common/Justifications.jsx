import React, { useState, useEffect } from 'react';
import { Card } from '../../Components/Common/Card';
import { Button } from '../../Components/Common/Button';
import { Input } from '../../Components/Common/Input';
import { Select } from '../../Components/Common/Select';
import { Badge } from '../../Components/Common/Badge';
import { Alert } from '../../Components/Common/Alert';
import { LoadingSpinner } from '../../Components/Common/LoadingSpinner';
import { Modal } from '../../Components/Common/Modal';
import { justificationService } from '../../Services/justificationService';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperClipIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Justifications = () => {
  const [userRole, setUserRole] = useState('intern');
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    date: '',
    reason: '',
    custom_reason: '',
    document: null
  });

  const [reviewData, setReviewData] = useState({
    status: 'approved',
    review_notes: ''
  });

  const quickReasons = {
    absence: [
      { value: 'salud', label: 'Salud (Gripe, malestar, etc.)' },
      { value: 'familiares', label: 'Motivos familiares (Viajes, eventos)' },
      { value: 'estudio', label: 'Estudios (Clases, exámenes, eventos uni)' },
      { value: 'personales', label: 'Trámites personales' },
      { value: 'otros', label: 'Otros (especificar)' }
    ],
    delay: [
      { value: 'trafico', label: 'Tráfico intenso' },
      { value: 'transporte', label: 'Problemas de transporte público' },
      { value: 'salud', label: 'Malestar de salud' },
      { value: 'personal', label: 'Emergencia personal' },
      { value: 'otros', label: 'Otros (especificar)' }
    ]
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'intern');
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    loadJustifications();
  }, []);

  const loadJustifications = async () => {
    try {
      setLoading(true);
      const response = await justificationService.getJustifications();
      console.log('Justifications response:', response);
      
      const data = Array.isArray(response) ? response : response.data || [];
      setJustifications(data);
    } catch (error) {
      console.error('Error loading justifications:', error);
      setMessage({ type: 'error', text: 'Error al cargar justificaciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.type) {
        setMessage({ type: 'error', text: 'Debes seleccionar el tipo de justificación' });
        return;
      }
      if (!formData.date) {
        setMessage({ type: 'error', text: 'Debes seleccionar la fecha' });
        return;
      }
      if (!formData.reason) {
        setMessage({ type: 'error', text: 'Debes seleccionar un motivo' });
        return;
      }
      if (formData.reason === 'otros' && !formData.custom_reason) {
        setMessage({ type: 'error', text: 'Debes especificar el motivo' });
        return;
      }

      setSubmitting(true);
      
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('date', formData.date);
      
      const reasonText = formData.reason === 'otros' 
        ? formData.custom_reason 
        : quickReasons[formData.type]?.find(r => r.value === formData.reason)?.label || formData.reason;
      
      submitData.append('reason', reasonText);
      
      if (formData.document) {
        submitData.append('document', formData.document);
      }

      await justificationService.createJustification(submitData);
      setMessage({ type: 'success', text: 'Justificación enviada correctamente' });
      setShowModal(false);
      resetForm();
      await loadJustifications();
    } catch (error) {
      console.error('Error submitting justification:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al enviar justificación'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (justificationId, status) => {
    try {
      setSubmitting(true);
      
      await justificationService.reviewJustification(
        justificationId,
        status,
        reviewData.review_notes
      );
      
      setMessage({ 
        type: 'success', 
        text: `Justificación ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente` 
      });
      
      setShowReviewModal(false);
      setSelectedJustification(null);
      setReviewData({ status: 'approved', review_notes: '' });
      await loadJustifications();
    } catch (error) {
      console.error('Error reviewing justification:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al revisar justificación'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      date: '',
      reason: '',
      custom_reason: '',
      document: null
    });
  };

  const openReviewModal = (justification) => {
    setSelectedJustification(justification);
    setReviewData({ status: 'approved', review_notes: '' });
    setShowReviewModal(true);
  };

  const filteredJustifications = activeTab === 'all' 
    ? justifications 
    : justifications.filter(j => j.status === activeTab);

  const stats = {
    total: justifications.length,
    pending: justifications.filter(j => j.status === 'pending').length,
    approved: justifications.filter(j => j.status === 'approved').length,
    rejected: justifications.filter(j => j.status === 'rejected').length
  };

  if (loading) {
    return <LoadingSpinner message="Cargando justificaciones..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Justificaciones</h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'intern' 
              ? 'Envía justificaciones por faltas o tardanzas' 
              : userRole === 'admin'
              ? 'Revisa y aprueba las justificaciones de los practicantes'
              : 'Visualiza las justificaciones del equipo'}
          </p>
        </div>
        {/* ✅ Solo practicantes pueden crear justificaciones */}
        {userRole === 'intern' && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Justificación
          </Button>
        )}
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <DocumentTextIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rechazadas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex border-b border-gray-200">
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'Todas' : 
               tab === 'pending' ? 'Pendientes' :
               tab === 'approved' ? 'Aprobadas' : 'Rechazadas'}
              {tab !== 'all' && ` (${stats[tab]})`}
            </button>
          ))}
        </div>
      </Card>

      {filteredJustifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay justificaciones
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? 'No se han registrado justificaciones' 
                : `No hay justificaciones ${activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}`}
            </p>
            {userRole === 'intern' && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Crear Primera Justificación
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJustifications.map(justification => (
            <Card key={justification.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {justification.type === 'absence' ? '🚫 Falta' : '⏰ Tardanza'} - {justification.date}
                      </h3>
                      {justification.user && (
                        <p className="text-sm text-gray-600 mb-2">
                          👤 Usuario: <span className="font-medium">{justification.user.name}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <strong>Motivo:</strong> {justification.reason}
                      </p>
                      {justification.document_path && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800">
                          <PaperClipIcon className="h-4 w-4" />
                          <a 
                            href={`/storage/${justification.document_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            📎 Ver documento adjunto
                          </a>
                        </div>
                      )}
                    </div>
                    <Badge type="status" value={justification.status}>
                      {justification.status === 'pending' ? '⏳ Pendiente' : 
                       justification.status === 'approved' ? '✅ Aprobada' : '❌ Rechazada'}
                    </Badge>
                  </div>

                  {justification.review_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">💬 Nota del revisor:</p>
                      <p className="text-sm text-gray-600 mt-1">{justification.review_notes}</p>
                    </div>
                  )}

                  {/* ✅ ADMIN: Botones de Aprobar/Rechazar directos */}
                  {userRole === 'admin' && justification.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openReviewModal(justification)}
                        disabled={submitting}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReview(justification.id, 'approved')}
                        disabled={submitting}
                        loading={submitting}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear justificación (solo practicantes) */}
      {userRole === 'intern' && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title="Nueva Justificación"
          size="lg"
        >
          <div className="space-y-4">
            <Select
              label="Tipo de Justificación"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Selecciona un tipo' },
                { value: 'absence', label: 'Falta' },
                { value: 'delay', label: 'Tardanza' },
              ]}
              required
            />

            <Input
              label="Fecha"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />

            {formData.type && quickReasons[formData.type] && (
              <Select
                label="Motivo"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Selecciona un motivo' },
                  ...quickReasons[formData.type].map(reason => ({
                    value: reason.value,
                    label: reason.label
                  }))
                ]} 
                required
              />
            )}

            {formData.reason === 'otros' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especifica el motivo *
                </label>
                <textarea
                  name="custom_reason"
                  value={formData.custom_reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe el motivo..."
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjuntar Evidencia (Opcional)
              </label>
              <input
                type="file"
                name="document"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: PDF, JPG, PNG (máx. 5MB)
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
                className="flex-1"
              >
                Enviar Justificación
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal para rechazar con nota (solo admin) */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedJustification(null);
          setReviewData({ status: 'approved', review_notes: '' });
        }}
        title="Rechazar Justificación"
        size="md"
      >
        {selectedJustification && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                ¿Estás seguro de que deseas rechazar esta justificación?
              </p>
              <div className="mt-2 text-sm">
                <p><strong>Usuario:</strong> {selectedJustification.user?.name}</p>
                <p><strong>Tipo:</strong> {selectedJustification.type === 'absence' ? 'Falta' : 'Tardanza'}</p>
                <p><strong>Fecha:</strong> {selectedJustification.date}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota para el practicante (Opcional)
              </label>
              <textarea
                value={reviewData.review_notes}
                onChange={(e) => setReviewData(prev => ({ ...prev, review_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Explica por qué se rechaza la justificación..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedJustification(null);
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReview(selectedJustification.id, 'rejected')}
                loading={submitting}
                disabled={submitting}
                className="flex-1"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Justifications;