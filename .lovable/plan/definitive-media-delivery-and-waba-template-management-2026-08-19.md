# Definitive media delivery and WABA template management

## Scope

1. Fix chat, workflow, and drip-campaign media so images, audio, and documents are delivered as native WhatsApp media and remain usable inside the app.
2. Add an Orchestration → Templates section for creating, previewing, submitting, and synchronizing official WhatsApp Business templates.

## Media delivery

- Stop persisting environment-specific preview URLs as the attachment source. Store the private storage object path with its MIME type, filename, and media kind, then resolve the bytes server-side whenever a provider needs them.
- For official WhatsApp Cloud inboxes, upload the actual bytes to Meta’s media endpoint first and send the returned media ID. This removes Meta’s dependency on fetching a preview/custom-domain URL and prevents the current `text/html` MIME failures.
- For Chatwoot, continue multipart delivery but load bytes directly from private storage rather than fetching the app URL. For Evolution, send a portable provider payload (base64 when the attachment is managed by this app, with URL fallback only for external media).
- Normalize supported formats and limits before sending:
  - images: JPEG/PNG;
  - audio: Ogg/Opus, MP3, M4A/AAC (browser WebM recordings remain remuxed to Ogg/Opus);
  - documents: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT/CSV;
  - preserve the original filename and truthful content type.
- Return and log the provider message ID only after the media request succeeds; surface the provider’s actual error in the conversation instead of reporting a false success.
- Render locally stored attachments through an authenticated download endpoint for signed-in users. Existing legacy proxy/signed URLs remain readable where possible, while new messages use portable storage references.
- Complete inbound WhatsApp Cloud media handling: use the webhook media ID to download the attachment from Meta, save it privately, and attach it to the message timeline so incoming audio/images/documents actually display and open.
- Apply the same attachment structure to direct chat, workflow graph nodes, and campaign media. Expand workflow/campaign file pickers to the supported document types and use the shared audio normalization path.

## WhatsApp template repository

- Add a space-scoped `waba_templates` table containing workspace, Meta template ID, name, language, category, status, rejection reason, component definition, and synchronization timestamps. Grant backend access, enable tenant RLS, add indexes, and add the update trigger in the same migration.
- Add thin authenticated server functions plus server-only Meta helpers to:
  - list local templates and synchronize remote templates from the selected WABA;
  - create/update local drafts;
  - submit drafts to Meta as `MARKETING`, `UTILITY`, or `AUTHENTICATION` templates;
  - refresh approval/rejection/paused status and rejection reasons;
  - delete local drafts and, when applicable, delete the corresponding Meta template after confirmation.
- Validate Meta rules before submission: lowercase template names, supported language, variable numbering/order, header/body/footer/button limits, category-specific restrictions, and required examples for variables/media headers.
- Build Orchestration → Templates with:
  - repository filters for workspace, category, language, and approval status;
  - editor for header (none/text/image/video/document), body, footer, and quick-reply/URL/phone buttons;
  - merge-field/example-value controls;
  - responsive WhatsApp-style phone preview showing text, media header, variables, footer, and buttons;
  - explicit Save draft, Submit for approval, Sync with Meta, and Delete actions with actionable errors.
- Only show WhatsApp Cloud workspaces that have a WABA ID and token configured. Credentials stay server-side and masked.

## Verification

- Add focused tests for media-type normalization, storage-reference resolution, Meta media upload/send payloads, template validation, and Meta template request mapping.
- Exercise a real configured WhatsApp Cloud call after implementation: upload one small media object, submit/send through the Meta API, and inspect the response and delivery record. Do not claim completion if Meta returns an error.
- Verify in the live app that uploaded images/audio/documents preview and open locally; direct chat, workflow, and campaign sends preserve filenames and status ticks; and the template editor/repository work on desktop and mobile without overflow.

## Technical details

- New attachments use a structured reference such as `{ storagePath, url?, mime, kind, filename, caption }`; `url` remains temporarily accepted for legacy/external records.
- The existing public media route will no longer be the primary provider transport. Provider sends read from private storage server-side, preventing auth gates, redirects, host changes, and HTML responses from corrupting media delivery.
- Meta API errors are terminal unless Meta returns a retryable server/rate-limit status; errors are preserved in the UI and message record.
