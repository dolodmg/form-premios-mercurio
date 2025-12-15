import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Eye, FileCheck, Loader2, AlertCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from "@/config/api"

interface CertificateRequest {
    id: number
    first_name: string
    last_name: string
    dni: string
    email: string
    phone_country_code: string
    phone_area_code: string
    phone_number: string
    jury_level: string
    company: string | null
    position: string | null
    photo_path: string
    certificate_path: string | null
    status: 'pending' | 'generated' | 'sent' | 'error'
    created_at: string
}

export function AdminDashboard() {
    const [requests, setRequests] = useState<CertificateRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [generatingIds, setGeneratingIds] = useState<Set<number>>(new Set())
    const [editingRequest, setEditingRequest] = useState<CertificateRequest | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSavingEdit, setIsSavingEdit] = useState(false)
    const { logout, token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setIsLoading(true)
        setError(null)
        try {
            if (!token) {
                throw new Error('No authentication token')
            }

            if (token.startsWith('dev-token')) {
                console.log('🔧 Modo desarrollo: mostrando datos de ejemplo')
                setTimeout(() => {
                    setRequests([
                        {
                            id: 1,
                            first_name: "Juan",
                            last_name: "Pérez",
                            dni: "12345678",
                            email: "juan.perez@ejemplo.com",
                            phone_country_code: "+54",
                            phone_area_code: "11",
                            phone_number: "12345678",
                            jury_level: "Senior",
                            company: "Empresa ABC",
                            position: "Director",
                            photo_path: "/background.jpg",
                            certificate_path: null,
                            status: 'pending' as const,
                            created_at: "2024-01-15 10:00:00"
                        },
                        {
                            id: 2,
                            first_name: "María",
                            last_name: "González",
                            dni: "87654321",
                            email: "maria.gonzalez@ejemplo.com",
                            phone_country_code: "+54",
                            phone_area_code: "11",
                            phone_number: "87654321",
                            jury_level: "Notable",
                            company: "Tech Solutions",
                            position: "Gerente",
                            photo_path: "/background.jpg",
                            certificate_path: null,
                            status: 'pending' as const,
                            created_at: "2024-01-15 11:30:00"
                        },
                    ])
                    setIsLoading(false)
                }, 500)
                return
            }

            const headers = getAuthHeaders(token)
            console.log('🔑 Headers enviados:', headers)
            console.log('📍 URL:', `${API_BASE_URL}${API_ENDPOINTS.listRequests}`)

            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.listRequests}`, {
                headers: headers,
            })

            if (!response.ok) {
                if (response.status === 401) {
                    logout()
                    navigate('/login')
                    return
                }
                throw new Error('Error al cargar las solicitudes')
            }

            const data = await response.json()

            if (data.success) {
                setRequests(data.data)
            } else {
                throw new Error(data.error || 'Error al cargar las solicitudes')
            }
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Error al cargar las solicitudes. Por favor intente nuevamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleViewImage = async (requestId: number) => {
        if (!token) return

        const photoUrl = `${API_BASE_URL}${API_ENDPOINTS.getPhoto(requestId.toString())}`
        setSelectedImage(photoUrl)
        setIsImageModalOpen(true)
    }

    const handleGenerateCertificate = async (requestId: number) => {
        if (!token) return

        setGeneratingIds(prev => new Set(prev).add(requestId))
        try {
            if (token.startsWith('dev-token')) {
                console.log('🔧 Modo desarrollo: simulando generación de certificado')
                await new Promise(resolve => setTimeout(resolve, 2000))

                setRequests(prev => prev.map(req =>
                    req.id === requestId
                        ? { ...req, status: 'generated' as const, certificate_path: 'mock_certificate.pdf' }
                        : req
                ))

                alert('✅ [MODO DEV] Certificado generado exitosamente (simulado)')
                return
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.generateCertificate(requestId.toString())}`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(token),
                }
            )

            const data = await response.json()

            if (data.success) {
                alert('Certificado generado y enviado exitosamente')
                fetchRequests()
            } else {
                alert(data.error || 'Error al generar el certificado')
            }
        } catch (err) {
            console.error(err)
            alert('Error al generar el certificado')
        } finally {
            setGeneratingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(requestId)
                return newSet
            })
        }
    }

    const handleEditRequest = (request: CertificateRequest) => {
        setEditingRequest(request)
        setIsEditModalOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingRequest || !token) return

        setIsSavingEdit(true)
        try {
            if (token.startsWith('dev-token')) {
                console.log('🔧 Modo desarrollo: simulando edición')
                await new Promise(resolve => setTimeout(resolve, 1000))
                alert('[MODO DEV] Solicitud editada exitosamente (simulado)')
                setIsEditModalOpen(false)
                fetchRequests()
                return
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.updateRequest(editingRequest.id.toString())}`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(token),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName: editingRequest.first_name,
                        lastName: editingRequest.last_name,
                        email: editingRequest.email,
                        juryLevel: editingRequest.jury_level,
                        company: editingRequest.company,
                        position: editingRequest.position,
                    }),
                }
            )

            const data = await response.json()

            if (data.success) {
                alert('Solicitud actualizada exitosamente')
                setIsEditModalOpen(false)
                fetchRequests()
            } else {
                alert(data.error || 'Error al actualizar la solicitud')
            }
        } catch (err) {
            console.error(err)
            alert('Error al actualizar la solicitud')
        } finally {
            setIsSavingEdit(false)
        }
    }

    const handleGetCertificate = (id: string) => {
        if (!id) {
            alert('No hay certificado disponible')
            return
        }

        try {
            const certificateUrl = `${API_BASE_URL}${API_ENDPOINTS.getCertificate(id)}`
            window.open(certificateUrl, '_blank')
        } catch (err) {
            console.error(err)
            alert('Error al abrir el certificado')
        }
    }


    if (isLoading) {
        return (
            <div
                className="min-h-screen w-full flex items-center justify-center"
                style={{
                    backgroundImage: "url(/background.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando solicitudes...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen w-full p-4 md:p-8"
            style={{
                backgroundImage: "url(/background.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                        <p className="text-white font-semibold mt-1">Gestión de solicitudes de certificados</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="shadow-sm hover:shadow-md transition-all"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Solicitudes de Certificados</CardTitle>
                        <CardDescription>
                            Lista de todas las solicitudes recibidas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Nombre</TableHead>
                                        <TableHead className="font-semibold">Apellido</TableHead>
                                        <TableHead className="font-semibold">DNI</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Teléfono</TableHead>
                                        <TableHead className="font-semibold">Nivel</TableHead>
                                        <TableHead className="font-semibold">Empresa</TableHead>
                                        <TableHead className="font-semibold">Cargo</TableHead>
                                        <TableHead className="font-semibold">Foto</TableHead>
                                        <TableHead className="font-semibold">Editar</TableHead>
                                        <TableHead className="font-semibold">Certificado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                                No hay solicitudes disponibles
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        requests.map((request) => (
                                            <TableRow key={request.id} className="hover:bg-muted/30">
                                                <TableCell className="font-medium">{request.first_name}</TableCell>
                                                <TableCell>{request.last_name}</TableCell>
                                                <TableCell>{request.dni}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{request.email}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {request.phone_country_code} {request.phone_area_code} {request.phone_number}
                                                </TableCell>
                                                <TableCell>{request.jury_level}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{request.company || '-'}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{request.position || '-'}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewImage(request.id)}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditRequest(request)}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    {request.status === 'generated' || request.status === 'sent' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="whitespace-nowrap border-green-500 text-green-600 hover:bg-green-50 cursor-pointer"
                                                            onClick={() => handleGetCertificate(request.id.toString())}
                                                        >
                                                            <FileCheck className="mr-1 h-3 w-3" />
                                                            Abrir
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleGenerateCertificate(request.id)}
                                                            disabled={generatingIds.has(request.id)}
                                                            className="whitespace-nowrap"
                                                        >
                                                            {generatingIds.has(request.id) ? (
                                                                <>
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                    Generando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileCheck className="mr-1 h-3 w-3" />
                                                                    Generar
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Foto del Solicitante</DialogTitle>
                        <DialogDescription>
                            Vista previa de la imagen adjunta
                        </DialogDescription>
                    </DialogHeader>
                    {selectedImage && token && (
                        <div className="flex justify-center items-center p-4">
                            <img
                                src={selectedImage}
                                alt="Foto del solicitante"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.src = '/background.jpg'
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Solicitud</DialogTitle>
                        <DialogDescription>
                            Modifica los datos de la solicitud
                        </DialogDescription>
                    </DialogHeader>
                    {editingRequest && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstName">Nombre</Label>
                                    <Input
                                        id="edit-firstName"
                                        value={editingRequest.first_name}
                                        onChange={(e) => setEditingRequest({
                                            ...editingRequest,
                                            first_name: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastName">Apellido</Label>
                                    <Input
                                        id="edit-lastName"
                                        value={editingRequest.last_name}
                                        onChange={(e) => setEditingRequest({
                                            ...editingRequest,
                                            last_name: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingRequest.email}
                                    onChange={(e) => setEditingRequest({
                                        ...editingRequest,
                                        email: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-juryLevel">Nivel</Label>
                                <Select
                                    value={editingRequest.jury_level}
                                    onValueChange={(value) => setEditingRequest({
                                        ...editingRequest,
                                        jury_level: value
                                    })}
                                >
                                    <SelectTrigger id="edit-juryLevel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Notable">Notable</SelectItem>
                                        <SelectItem value="Experto">Experto</SelectItem>
                                        <SelectItem value="Senior">Senior</SelectItem>
                                        <SelectItem value="Idóneo">Idóneo</SelectItem>
                                        <SelectItem value="Participante novel">Participante novel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-company">Empresa</Label>
                                    <Input
                                        id="edit-company"
                                        value={editingRequest.company || ''}
                                        onChange={(e) => setEditingRequest({
                                            ...editingRequest,
                                            company: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-position">Cargo</Label>
                                    <Input
                                        id="edit-position"
                                        value={editingRequest.position || ''}
                                        onChange={(e) => setEditingRequest({
                                            ...editingRequest,
                                            position: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSavingEdit}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    disabled={isSavingEdit}
                                >
                                    {isSavingEdit ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar cambios'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
