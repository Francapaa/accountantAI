"""Provider abstraction for the WhatsApp transport.

See docs/sdd/010-whatsapp-adapter.md. The chat core depends on this interface and not on
any concrete library, so the transport can be swapped without rewriting core code.
"""

from __future__ import annotations

from typing import Protocol

from app.whatsapp.schemas import ProviderOutboundPayload


class IWhatsAppProvider(Protocol):
    """Contract every WhatsApp transport must implement."""

    name: str

    def send_message(
        self, payload: ProviderOutboundPayload, *, phone_number_id: str
    ) -> str:
        """Send a message (free-form or template) and return the provider message id.

        Within the 24h conversation window, `payload.template` is None and the send is
        free-form (free). Outside the window a `TemplateRef` must be provided.
        """
        ...