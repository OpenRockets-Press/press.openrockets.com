import { onRequestPost as __api_admin_bootstrap_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\admin-bootstrap.ts"
import { onRequestGet as __api_admin_dashboard_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\admin-dashboard.ts"
import { onRequestPost as __api_confirm_consent_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\confirm-consent.ts"
import { onRequestPost as __api_dsar_handler_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\dsar-handler.ts"
import { onRequestPost as __api_generate_pub_id_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\generate-pub-id.ts"
import { onRequestGet as __api_get_audit_log_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\get-audit-log.ts"
import { onRequestGet as __api_get_case_messages_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\get-case-messages.ts"
import { onRequestPost as __api_get_case_upload_token_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\get-case-upload-token.ts"
import { onRequestGet as __api_home_feed_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\home-feed.ts"
import { onRequestGet as __api_list_cases_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\list-cases.ts"
import { onRequestGet as __api_list_users_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\list-users.ts"
import { onRequestPost as __api_manage_user_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\manage-user.ts"
import { onRequestGet as __api_me_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\me.ts"
import { onRequestGet as __api_moderation_dashboard_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\moderation-dashboard.ts"
import { onRequestPost as __api_open_case_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\open-case.ts"
import { onRequestPost as __api_promote_user_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\promote-user.ts"
import { onRequestPost as __api_register_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\register.ts"
import { onRequestPost as __api_reply_case_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\reply-case.ts"
import { onRequestPost as __api_resolve_case_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\resolve-case.ts"
import { onRequestPost as __api_retract_publication_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\retract-publication.ts"
import { onRequestPost as __api_review_publication_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\review-publication.ts"
import { onRequestGet as __api_serve_pdf_ts_onRequestGet } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\serve-pdf.ts"
import { onRequestPost as __api_submit_publication_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\submit-publication.ts"
import { onRequestPost as __api_track_event_ts_onRequestPost } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\track-event.ts"
import { onRequest as __api__middleware_ts_onRequest } from "C:\\Users\\HP\\Documents\\trash\\press.openrockets.com\\functions\\api\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/admin-bootstrap",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_bootstrap_ts_onRequestPost],
    },
  {
      routePath: "/api/admin-dashboard",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_dashboard_ts_onRequestGet],
    },
  {
      routePath: "/api/confirm-consent",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_confirm_consent_ts_onRequestPost],
    },
  {
      routePath: "/api/dsar-handler",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_dsar_handler_ts_onRequestPost],
    },
  {
      routePath: "/api/generate-pub-id",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_pub_id_ts_onRequestPost],
    },
  {
      routePath: "/api/get-audit-log",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_audit_log_ts_onRequestGet],
    },
  {
      routePath: "/api/get-case-messages",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_case_messages_ts_onRequestGet],
    },
  {
      routePath: "/api/get-case-upload-token",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_get_case_upload_token_ts_onRequestPost],
    },
  {
      routePath: "/api/home-feed",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_home_feed_ts_onRequestGet],
    },
  {
      routePath: "/api/list-cases",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_list_cases_ts_onRequestGet],
    },
  {
      routePath: "/api/list-users",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_list_users_ts_onRequestGet],
    },
  {
      routePath: "/api/manage-user",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_manage_user_ts_onRequestPost],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_me_ts_onRequestGet],
    },
  {
      routePath: "/api/moderation-dashboard",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_moderation_dashboard_ts_onRequestGet],
    },
  {
      routePath: "/api/open-case",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_open_case_ts_onRequestPost],
    },
  {
      routePath: "/api/promote-user",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_promote_user_ts_onRequestPost],
    },
  {
      routePath: "/api/register",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_register_ts_onRequestPost],
    },
  {
      routePath: "/api/reply-case",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_reply_case_ts_onRequestPost],
    },
  {
      routePath: "/api/resolve-case",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_resolve_case_ts_onRequestPost],
    },
  {
      routePath: "/api/retract-publication",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_retract_publication_ts_onRequestPost],
    },
  {
      routePath: "/api/review-publication",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_review_publication_ts_onRequestPost],
    },
  {
      routePath: "/api/serve-pdf",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_serve_pdf_ts_onRequestGet],
    },
  {
      routePath: "/api/submit-publication",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submit_publication_ts_onRequestPost],
    },
  {
      routePath: "/api/track-event",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_track_event_ts_onRequestPost],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "",
      middlewares: [__api__middleware_ts_onRequest],
      modules: [],
    },
  ]