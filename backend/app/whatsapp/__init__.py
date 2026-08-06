"""WhatsApp transport — see docs/sdd/010-whatsapp-adapter.md.

The core depends on `IWhatsAppProvider`, not on the underlying Meta/browser library,
so the transport can be swapped (Meta Cloud API → controlled Baileys pilot) without
rewriting the chat core.
"""