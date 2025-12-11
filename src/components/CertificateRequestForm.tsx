import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CheckCircle2, Loader2, AlertCircle, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Country codes for phone number
const COUNTRY_CODES = [
    { code: "AR", label: "AR (+54)", dialCode: "+54" },
    { code: "MX", label: "MX (+52)", dialCode: "+52" },
    { code: "US", label: "US (+1)", dialCode: "+1" },
    { code: "ES", label: "ES (+34)", dialCode: "+34" },
    { code: "BR", label: "BR (+55)", dialCode: "+55" },
    { code: "CL", label: "CL (+56)", dialCode: "+56" },
    { code: "CO", label: "CO (+57)", dialCode: "+57" },
    { code: "PE", label: "PE (+51)", dialCode: "+51" },
    { code: "VE", label: "VE (+58)", dialCode: "+58" },
    { code: "EC", label: "EC (+593)", dialCode: "+593" },
    { code: "UY", label: "UY (+598)", dialCode: "+598" },
    { code: "PY", label: "PY (+595)", dialCode: "+595" },
]

const formSchema = z.object({
    firstName: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    lastName: z.string().min(2, {
        message: "El apellido debe tener al menos 2 caracteres.",
    }),
    dni: z.string().min(7, {
        message: "Ingrese un DNI válido.",
    }),
    email: z.string().email({
        message: "Ingrese un correo electrónico válido.",
    }),
    phoneCountryCode: z.string().min(1, {
        message: "Seleccione un código de país.",
    }),
    phoneAreaCode: z.string().min(1, {
        message: "Ingrese el código de área.",
    }),
    phoneNumber: z.string().min(6, {
        message: "Ingrese un número de teléfono válido.",
    }),
    juryLevel: z.enum(["Notable", "Experto", "Senior", "Idóneo", "Participante nobel"]),
    company: z.string().min(2, {
        message: "Ingrese el nombre de la empresa.",
    }),
    position: z.string().min(2, {
        message: "Ingrese su cargo.",
    }),
    photo: z.instanceof(File, {
        message: "Por favor seleccione una foto.",
    }),
})

export function CertificateRequestForm() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dni: "",
            email: "",
            phoneCountryCode: "",
            phoneAreaCode: "",
            phoneNumber: "",
            company: "",
            position: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)
        try {
            // Create FormData to handle file upload
            const formData = new FormData()
            formData.append("firstName", values.firstName)
            formData.append("lastName", values.lastName)
            formData.append("dni", values.dni)
            formData.append("email", values.email)
            formData.append("phoneCountryCode", values.phoneCountryCode)
            formData.append("phoneAreaCode", values.phoneAreaCode)
            formData.append("phoneNumber", values.phoneNumber)
            formData.append("juryLevel", values.juryLevel)
            formData.append("company", values.company)
            formData.append("position", values.position)
            formData.append("photo", values.photo)

            const response = await fetch("https://n8n.pupuia.com/webhook/b7570bea-d1e6-4bcd-b18e-0a30a2450644", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Error al enviar la solicitud. Por favor intente nuevamente.")
            }

            setIsSubmitted(true)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue("photo", file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (isSubmitted) {
        return (
            <div
                className="min-h-screen w-full flex items-center justify-center p-4"
                style={{
                    backgroundImage: "url(/background.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center text-green-600 mb-4">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <CardTitle className="text-2xl text-primary">¡Solicitud Enviada!</CardTitle>
                        <CardDescription className="text-base">
                            Gracias por solicitar su certificado. Hemos recibido sus datos correctamente.
                        </CardDescription>
                        <Button
                            className="w-full mt-4"
                            onClick={() => {
                                setIsSubmitted(false)
                                setPhotoPreview(null)
                                form.reset()
                            }}
                        >
                            Solicitar otro certificado
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 py-8"
            style={{
                backgroundImage: "url(/background.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center text-primary">
                        Solicitud de Certificado
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Complete el formulario para recibir su certificado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Juan" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Pérez" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="dni"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DNI</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12345678" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="juan.perez@ejemplo.com"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Teléfono</FormLabel>
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-4">
                                        <FormField
                                            control={form.control}
                                            name="phoneCountryCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        disabled={isLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="País" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {COUNTRY_CODES.map((country) => (
                                                                <SelectItem key={country.code} value={country.code}>
                                                                    {country.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name="phoneAreaCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Área" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Número" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="juryLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione su nivel" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Notable">Notable</SelectItem>
                                                <SelectItem value="Experto">Experto</SelectItem>
                                                <SelectItem value="Senior">Senior</SelectItem>
                                                <SelectItem value="Idóneo">Idóneo</SelectItem>
                                                <SelectItem value="Participante nobel">Participante novel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Empresa</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre de la empresa" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cargo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Su cargo" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="photo"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Foto</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        disabled={isLoading}
                                                        className="cursor-pointer"
                                                    />
                                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                {photoPreview && (
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={photoPreview}
                                                            alt="Vista previa"
                                                            className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full text-base py-6 font-semibold shadow-sm transition-all hover:scale-[1.01]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Solicitud"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
