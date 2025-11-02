import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { sendSupportEmail } from "../../actions/send-support-email";
import { UIMessage } from "@ai-sdk/react";
import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useUserStore } from "@/store/user-store";
// TODO: createClient from backend API - using auth context instead

export default function SupportForm({ summary, locale, messages, setMessages, sendMessage }: {
    summary: string,
    locale: 'en' | 'fr',
    messages: UIMessage[],
    setMessages: (messages: UIMessage[]) => void,
    sendMessage: (message: { text: string; files?: FileList; metadata?: unknown; messageId?: string } | { files: FileList; metadata?: unknown; messageId?: string }) => Promise<void>
}) {
    const [isContactFormOpen, setIsContactFormOpen] = useState(true)
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [additionalInfo, setAdditionalInfo] = useState('')
    const user = useUserStore(state => state.user)

    useEffect(() => {
        // Use user from store instead of Supabase
        if (user) {
            setName(user.name || user.email || '')
            setEmail(user.email || '')
        }
    }, [user])

    const handleSendEmail = useCallback(async () => {
        if (isSendingEmail) return

        setIsSendingEmail(true)
        try {
            const contactInfo = { name, email, additionalInfo, locale }
            const result = await sendSupportEmail({
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.parts.filter(part => part.type === 'text').map(part => part.text).join('')
                })),
                summary,
                contactInfo,
            })
            if (result.success) {
                toast.success('Email sent successfully', {
                    description: 'Your support request has been submitted',
                    duration: 5000,
                })
                // Add confirmation message using sendMessage
                setMessages([
                    ...messages,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        parts: [{
                            type: 'text',
                            text: `Thank you ${contactInfo.name}. Your support request has been sent to ${contactInfo.email}. We'll get back to you soon.`
                        }]
                    }
                ])
                setIsContactFormOpen(false)
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Error sending email:', error)
            toast.error('Failed to send email', {
                description: 'An error occurred. Please try again.',
                duration: 5000,
            })
        } finally {
            setIsSendingEmail(false)
        }
    }, [isSendingEmail, messages, setMessages, name, email, additionalInfo, locale, summary])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSendEmail()
    }

    return (
        <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contact Information</DialogTitle>
                    <DialogDescription>
                        Please provide your contact information so we can get back to you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="summary">Summary</Label>
                        <Textarea
                            id="summary"
                            value={summary}
                            readOnly
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                            id="additionalInfo"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder="Any additional information you'd like to share..."
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                            setIsContactFormOpen(false);
                            sendMessage(
                                {
                                    text: 'Cancel',
                                },
                            );
                        }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSendingEmail}>
                            {isSendingEmail ? 'Sending...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )

}