import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./button-BXrfXN_b.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { l as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { c as createSsrRpc } from "./client-Cq9-7bp9.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";
import { o as objectType, b as booleanType, s as stringType, n as numberType, e as enumType, r as recordType, a as arrayType, d as anyType, c as coerce } from "../_libs/zod.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
const listLeads = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f0e93a0b7066b7c79999a92f026934cfc6656b011cf6524a61d5aa02251d0632"));
const updateLeadStage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  stage: stringType().min(1)
}).parse(d)).handler(createSsrRpc("825baabcd2e01f1299a63f2a8983d830cafb53e43441866f672e50d3e6f84c72"));
const toggleHumanTakeover = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1),
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("865375d9ccafee3d1229b082d70de486e66adb59e64b84339c9fba1aee4ad269"));
const deleteLead = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("51393a7c454620868fb50a10e9147854d1cfc9cc0cb94e14dbc0b8d4db4791e9"));
const listConversations = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2b4d2e59f3254b842a76a501b6da5ab7b8c16005a79e1d77989c2d30835a8f35"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("23974f2d0c70549522eb1ebb0e91a21c4d86f65ecc631f4a20385cf0d7471122"));
const listMessageThreads = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  search: stringType().max(200).optional(),
  limit: numberType().int().min(10).max(50).optional(),
  offset: numberType().int().min(0).max(1e4).optional()
}).parse(d ?? {})).handler(createSsrRpc("9a62019c9c28a0c86cc6481d2e1748e8ebcc47d59266e272f978e7b3a6f40c09"));
const listConversationMessages = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  limit: numberType().int().min(1).max(1e3).optional()
}).parse(d)).handler(createSsrRpc("02c8c501c1fac8aa0095749c2a480a9ec3cf94537cbf03922b721d8e661df9cd"));
const listAppointments = createServerFn({
  method: "GET"
}).handler(createSsrRpc("564a4016049afdf95c3c424566a3feca0914abd1ac919b34b25c47f7d12b4189"));
const updateAppointmentStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["pending", "confirmed", "completed", "cancelled"]),
  appointment_date: stringType().nullable().optional()
}).parse(d)).handler(createSsrRpc("197a0c862f5e9927f094c52fdb720aa9f4763d423fc2d5ba6d5c7f440ec09f8f"));
const getSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7180026c600c721a62b1ac583b5fea60a9a24b9cef2c2e9d29b375367c760773"));
const settingsSchema = objectType({
  id: stringType().uuid().optional(),
  company_name: stringType().max(200).optional(),
  company_phone: stringType().max(60).nullable().optional(),
  company_email: stringType().max(200).nullable().optional(),
  office_address: stringType().max(500).nullable().optional(),
  working_hours: stringType().max(200).nullable().optional(),
  active_destinations: stringType().max(2e3).nullable().optional(),
  active_programs: stringType().max(2e3).nullable().optional(),
  scholarship_information: stringType().max(4e3).nullable().optional(),
  whatsapp_webhook_url: stringType().max(500).nullable().optional(),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_inbox_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  // White-label branding (per-space)
  brand_name: stringType().max(120).nullable().optional(),
  brand_tagline: stringType().max(300).nullable().optional(),
  logo_light_url: stringType().max(3e6).nullable().optional(),
  logo_dark_url: stringType().max(3e6).nullable().optional(),
  logo_scale: coerce.number().int().min(50).max(300).nullable().optional()
});
const updateSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => settingsSchema.parse(d)).handler(createSsrRpc("7360a65b44b390ce454157541ae48f1b17feecce8fdb6b9e8a5af44cfc399626"));
const getAiConfig = createServerFn({
  method: "GET"
}).handler(createSsrRpc("13e4dc2eebece3ebba74f145e6a44ddafa474f649ded3187578efe489127a756"));
const saveAiConfig = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  system_prompt: stringType().max(5e4),
  model: stringType().min(1).max(100),
  temperature: numberType().min(0).max(2)
}).parse(d)).handler(createSsrRpc("24e1c1463017b740a61277061d0e4df5d075a8ee0a304ff4467d4470e1c44f08"));
const saveAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider_mode: enumType(["built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional()
}).parse(d)).handler(createSsrRpc("b62418704bebf2a3b1fc360ceed67e8c40d309e6b75692cdf9c950157b72a0ad"));
const testAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  provider_mode: enumType(["built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional()
}).parse(d)).handler(createSsrRpc("0541c2b8a4d13a7e9ba6f76aacb1657b1dec2aec167ffddd6ebb4533447b833d"));
const listAiProviders = createServerFn({
  method: "GET"
}).handler(createSsrRpc("eb9823de071ea6bb3e86a38ed7bdfc2f036aa8acbea52ebfa25a2701fc6201d4"));
const providerPoolSchema = objectType({
  id: stringType().uuid().optional(),
  label: stringType().max(120).optional(),
  provider: stringType().min(1).max(100),
  base_url: stringType().max(500).nullable().optional(),
  models: arrayType(stringType().min(1).max(200)).max(25),
  api_key: stringType().max(2e3).nullable().optional(),
  enabled: booleanType().optional(),
  priority: numberType().int().min(0).max(1e3).optional()
});
const saveAiProviderPool = createServerFn({
  method: "POST"
}).inputValidator((d) => providerPoolSchema.parse(d)).handler(createSsrRpc("81a4541797d12907d7c89e5c66e19a2815ab943462bb25103102789e2a25e008"));
const deleteAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("32a1e2a372abf770d5b154b3c2160f8e5508f9f5a0def7a4c833c95dfae4c6ec"));
const reorderAiProviders = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  order: arrayType(stringType().uuid()).max(50)
}).parse(d)).handler(createSsrRpc("e797e8175d224c32a4d8048c0f4eaf0aa8e336e098e43bbec29809e408c00479"));
const setFallbackEnabled = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("a57b02ab4b911d002e0fc4e5c23da5ace8c2ac6e932b67a8a4ebaa89e2f409df"));
const testAiProviderPool = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider: stringType().min(1).max(100),
  base_url: stringType().max(500).nullable().optional(),
  model: stringType().min(1).max(200),
  api_key: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("0ad581a4cea2ac1d973f1c42afaec63983782d7f6da130d464d4efce3538de0f"));
const listPromptVersions = createServerFn({
  method: "GET"
}).handler(createSsrRpc("52607a6cc61f168ef0d44392548f95e38774a4bff42ec75aea0a2d8e6bf8a8d1"));
const listAiVariables = createServerFn({
  method: "GET"
}).handler(createSsrRpc("58e1462d19c125efd345c981b757c6f3e7d13cd5a7cb99a9fbb63e84ece5bce9"));
const upsertAiVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  variable_name: stringType().min(1).max(100).regex(/^[A-Z0-9_]+$/),
  variable_value: stringType().max(2e3),
  description: stringType().max(500).nullable().optional()
}).parse(d)).handler(createSsrRpc("a755caa91272b301890cba49b6956161a3cf8542de43edbec63e28bfae5900a1"));
const deleteAiVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8afe1fc610729473cda96c40b70a63152808e686513f32da5538f5d3a0c02e2a"));
const listHttpActions = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d37ffddafc3b5eb13af17cc93be0b6cf2f22827948b3c3bc2c59ee84b5ae664c"));
const upsertHttpAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  trigger_stage: stringType().min(1).max(100),
  url: stringType().url().max(1e3),
  method: enumType(["POST", "GET", "PUT", "PATCH"]),
  headers: recordType(stringType(), stringType()).optional(),
  payload_template: stringType().max(1e4),
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("86f152a60e6c47ac360b71d69625bf9fa4cc372691a904fc0aa4fda4340a0b58"));
const deleteHttpAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c06b718bc55b75cfe58b1e201e5678e944c142692ff8c0983342201cbd4a47f0"));
const testPrompt = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  message: stringType().min(1).max(4e3),
  phone: stringType().max(60).optional()
}).parse(d)).handler(createSsrRpc("953debe6bbad54855647525573f9fa910337130f082a4420e0b8160248ab3716"));
const getDashboardStats = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d8dd0f2f33ee8ce5e2ea2bfc749715b8e981950fa8bc0e14ec15d540b50039e9"));
const sendHumanMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  message: stringType().min(1).max(4e3),
  workspaceId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("0e7aa1648511bbf1542fd49315db551c43322e38f2328b59f7e42d6300e0a674"));
const startConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  name: stringType().min(1).max(200).optional(),
  workspaceId: stringType().uuid().optional(),
  message: stringType().min(1).max(4e3)
}).parse(d)).handler(createSsrRpc("8d253e5b4831da25aa156bcfa56d75dcd7076c12e19b4aff4e5470996e15c01c"));
const listScheduledMessages = createServerFn({
  method: "GET"
}).handler(createSsrRpc("ad1643801ede61d74514e1094b8f221a71f752841fb9210dda546612d90407d5"));
const scheduleMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  message: stringType().min(1).max(4e3),
  scheduledFor: stringType().min(1)
}).parse(d)).handler(createSsrRpc("883b00768c8c2b8026046c9eb39fc8611565f3cbe8278b2bac7d7ad0aecb8c13"));
const cancelScheduledMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("456f762fcd34813bc6451d1571226817d097283ce129ec1df0fecbd3de40b329"));
const listWorkspaces = createServerFn({
  method: "GET"
}).handler(createSsrRpc("6d2f2003ef6c38cba68de8895e418fb6a1d0e684d8d1cda5f472c9858e1aa393"));
const workspaceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  provider_type: enumType(["chatwoot", "evolution", "waba"]).optional(),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_inbox_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  evolution_url: stringType().max(500).nullable().optional(),
  evolution_api_key: stringType().max(500).nullable().optional(),
  evolution_instance: stringType().max(200).nullable().optional(),
  waba_phone_number_id: stringType().max(100).nullable().optional(),
  waba_business_account_id: stringType().max(100).nullable().optional(),
  waba_access_token: stringType().max(500).nullable().optional(),
  waba_api_version: stringType().max(20).nullable().optional(),
  waba_verify_token: stringType().max(300).nullable().optional(),
  waba_app_secret: stringType().max(500).nullable().optional(),
  waba_display_name: stringType().max(100).nullable().optional(),
  enabled: booleanType().optional(),
  is_default: booleanType().optional(),
  use_shared_ai: booleanType().optional()
});
const upsertWorkspace = createServerFn({
  method: "POST"
}).inputValidator((d) => workspaceSchema.parse(d)).handler(createSsrRpc("bd0c10c3d71df975f9a7c322a8b1cb774ed4e90ae3fbb95f879e30d69d5eea30"));
const deleteWorkspace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c40056803d857e2486e3d4f3f6d7e8f0fc233a635670f378fe81fc11be8b261e"));
const setEvolutionWebhook = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  evolution_url: stringType().min(1).max(500),
  evolution_api_key: stringType().max(500).optional(),
  evolution_instance: stringType().min(1).max(200),
  webhookUrl: stringType().url().max(500)
}).parse(d)).handler(createSsrRpc("ebe6d9ce2cf65372a2f93b8547332d4b4d5ed1807c5114e34d962c979d877d0a"));
const testWorkspaceConnection = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider_type: enumType(["chatwoot", "evolution", "waba"]),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  evolution_url: stringType().max(500).nullable().optional(),
  evolution_api_key: stringType().max(500).nullable().optional(),
  evolution_instance: stringType().max(200).nullable().optional(),
  waba_phone_number_id: stringType().max(100).nullable().optional(),
  waba_business_account_id: stringType().max(100).nullable().optional(),
  waba_access_token: stringType().max(500).nullable().optional(),
  waba_api_version: stringType().max(20).nullable().optional()
}).parse(d)).handler(createSsrRpc("4e98ad4bc171ac6474d4d22d3267fe1d4591a372f03b21e8437ed7486ba90df4"));
const listResponderAgents = createServerFn({
  method: "GET"
}).handler(createSsrRpc("e37c15b1836defd0d9880d82f89d426b3c046a45fbe5055a3c8bd9716d15b842"));
const responderAgentSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional(),
  system_prompt: stringType().max(5e4),
  model: stringType().min(1).max(100),
  temperature: numberType().min(0).max(2),
  provider_mode: enumType(["inherit", "built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional(),
  inherit_variables: booleanType(),
  enabled: booleanType()
});
const upsertResponderAgent = createServerFn({
  method: "POST"
}).inputValidator((d) => responderAgentSchema.parse(d)).handler(createSsrRpc("20e65fdb203b5171275d62545ec5a251cc84f18dc147d735f2ce8adc6ad3d632"));
const deleteResponderAgent = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2bb66c2d3f2895a457b0d983ebdd86324feff86d6de6f6d9571b0f2cd6ce5760"));
const listResponderAgentVariables = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  agentId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ebd250ee813ec8c5bbf5349154ac1ac9dba7aff6b8e41051bf4b10270b63806a"));
const upsertResponderAgentVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  agent_id: stringType().uuid(),
  variable_name: stringType().min(1).max(100).regex(/^[A-Z0-9_]+$/),
  variable_value: stringType().max(2e3),
  description: stringType().max(500).nullable().optional()
}).parse(d)).handler(createSsrRpc("5228ff2a4da0b65c98975ef231c9086c9b48907dd519d9963a4fc3ccbf6a7bfe"));
const deleteResponderAgentVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0437bc527358ea40e84168d2681cf12209b54cc1b7ba07bee2b78e48e7f9ac75"));
const listWorkflows = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8817508e78df521de8f00a80415c9431f2ad0b2c1df5f50661131f8e19972ad4"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("99d88c22ed58f65406bcece6dd8e0282b66384b204a4342850cfeb4e8563517d"));
const workflowSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional(),
  agent_id: stringType().uuid().nullable().optional(),
  trigger_type: enumType(["manual", "pipeline_stage", "time_since_first_message", "time_since_last_message", "booking_status"]).optional(),
  trigger_config: objectType({
    segment: stringType().max(100).optional(),
    amount: numberType().min(0).max(1e5).optional(),
    unit: enumType(["seconds", "minutes", "hours", "days"]).optional(),
    status: enumType(["pending", "confirmed", "completed", "cancelled"]).optional()
  }).optional(),
  trigger_segment: stringType().min(1).max(100).optional(),
  enabled: booleanType(),
  graph: anyType().optional()
});
const upsertWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => workflowSchema.parse(d)).handler(createSsrRpc("790071a7841e58281ff9edf77fb76210117f19f310f8994e3ee65c4737bdaaf9"));
createServerFn({
  method: "POST"
}).handler(createSsrRpc("d092086720309421ae894c32c66ad3573d7b3ca8732e317adedb9a0895ed0290"));
const deleteWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("624de0f426b99fc8bd24410df7c564c3de2b6e41ec4a7b20ae273eb773f7abfe"));
const listActiveWorkflows = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7b12eb82f1a429cbbd09f3c85d3fbacbe2b4fa0112e875b07fe56db6e0c5a745"));
const triggerLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  workflowId: stringType().uuid(),
  phone: stringType().min(1).max(60),
  workspaceId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createSsrRpc("dacd3c7e914c8438f804a485fff697f1e5daada875cd5c2ab8d0f0979cdb1d03"));
const listMeetingOutcomes = createServerFn({
  method: "GET"
}).handler(createSsrRpc("e0900568cd95d7036f7b4f572bb10f167d4437bf97f89bb9233c17de0cc5c6f7"));
const meetingOutcomeSchema = objectType({
  lead_id: stringType().uuid(),
  meeting_date: stringType().min(1).optional(),
  outcome: enumType(["ready_to_pay", "parent_discussion", "financial_delay", "future_applicant", "not_qualified"]),
  commitment_level: enumType(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: stringType().max(100).nullable().optional(),
  next_action: stringType().max(100).nullable().optional(),
  follow_up_date: stringType().max(40).nullable().optional(),
  internal_notes: stringType().max(5e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional()
});
const saveMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => meetingOutcomeSchema.parse(d)).handler(createSsrRpc("99568c530a7ecd49cbbd9f6c4ec06c7dbbcbc3b92247357f1996d55ab2f8819b"));
const updateMeetingOutcomeSchema = objectType({
  id: stringType().uuid(),
  outcome: enumType(["ready_to_pay", "parent_discussion", "financial_delay", "future_applicant", "not_qualified"]),
  commitment_level: enumType(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: stringType().max(100).nullable().optional(),
  next_action: stringType().max(100).nullable().optional(),
  follow_up_date: stringType().max(40).nullable().optional(),
  internal_notes: stringType().max(5e3).nullable().optional()
});
const updateMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => updateMeetingOutcomeSchema.parse(d)).handler(createSsrRpc("a5862b4a7392e595242d8471a57c7aa0030669a214d3749f88639c2ddec3ecf0"));
const getMeetingOutcomeStats = createServerFn({
  method: "GET"
}).handler(createSsrRpc("364620d9768c1f98a5db7344080f8433b793ca08e1dc6c4d279786921253883a"));
const deleteMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8b4ea44888678761b2bed0e29cdf9e531d4673d812c609995c1b5c2c378bc7ef"));
const processDueWorkflows = createServerFn({
  method: "POST"
}).handler(createSsrRpc("c2712e5db5e52b9f6c2978d9009d1aa8ae496911c8bedbb48c9b44eff52dc2b2"));
const listWorkflowStates = createServerFn({
  method: "GET"
}).handler(createSsrRpc("1f1865c13caac15197f9fc2542dfc2b29416d27f4968c190d3b6d71978d481ca"));
const pauseLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  paused: booleanType()
}).parse(d)).handler(createSsrRpc("a518d2d3284cb90077e775b3bbd4225e7b9e60249987d261096a1e01369ee275"));
const listContacts = createServerFn({
  method: "GET"
}).handler(createSsrRpc("4cf58d2d1f1e29b559294f4f1c402c449ddd01d68d7d73f8c008e1fd4419fb00"));
const listLeadWorkflows = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60)
}).parse(d)).handler(createSsrRpc("ee41387a2c2f7d1249e4cc0da5bd5c9009aa9ce45c3928daffee0cabd22874b8"));
const assignLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  workflowId: stringType().uuid(),
  goalAt: stringType().min(1).max(40).nullable().optional()
}).parse(d)).handler(createSsrRpc("8c801bac72f2ae1b1db8e156395e60d29fc6a9474f900a962737946ed2f80151"));
const removeLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  workflowId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("25b053a1ae71f696e147e730db4a3880efbd3b2b2a234ab63ea2a7ba8a2491e2"));
const url$1 = "/__l5e/assets-v1/b70ab0f4-43f7-4a36-916b-c820fe1a3796/fliq-logo-light.png";
const logoLightAsset = {
  url: url$1
};
const url = "/__l5e/assets-v1/cc03785a-59a4-4548-8685-394e7d372781/fliq-logo-dark.png";
const logoDarkAsset = {
  url
};
const DEFAULT_BRAND = {
  name: "fliq",
  tagline: "Linkmoore Education · AI Admissions Platform",
  logoLight: logoLightAsset.url,
  logoDark: logoDarkAsset.url
};
const DEFAULT_LOGO_SCALE = 100;
function useBranding() {
  const getFn = useServerFn(getSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  const s = data?.settings ?? null;
  const rawScale = Number(s?.logo_scale);
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : DEFAULT_LOGO_SCALE;
  return {
    name: s?.brand_name || s?.company_name || DEFAULT_BRAND.name,
    tagline: (s?.brand_tagline ?? DEFAULT_BRAND.tagline) || DEFAULT_BRAND.tagline,
    logoLight: s?.logo_light_url || DEFAULT_BRAND.logoLight,
    logoDark: s?.logo_dark_url || DEFAULT_BRAND.logoDark,
    scale
  };
}
export {
  upsertWorkflow as $,
  updateMeetingOutcome as A,
  deleteMeetingOutcome as B,
  processDueWorkflows as C,
  DEFAULT_BRAND as D,
  listLeadWorkflows as E,
  assignLeadWorkflow as F,
  removeLeadWorkflow as G,
  listWorkflows as H,
  Input as I,
  deleteWorkflow as J,
  listResponderAgents as K,
  Label as L,
  listAiVariables as M,
  deleteResponderAgent as N,
  getAiConfig as O,
  saveAiProvider as P,
  testAiProvider as Q,
  saveAiConfig as R,
  listPromptVersions as S,
  upsertAiVariable as T,
  deleteAiVariable as U,
  testWorkspaceConnection as V,
  deleteWorkspace as W,
  listHttpActions as X,
  upsertHttpAction as Y,
  deleteHttpAction as Z,
  testPrompt as _,
  useServerFn as a,
  upsertResponderAgent as a0,
  getSettings as a1,
  updateSettings as a2,
  listAiProviders as a3,
  saveAiProviderPool as a4,
  deleteAiProvider as a5,
  reorderAiProviders as a6,
  setFallbackEnabled as a7,
  testAiProviderPool as a8,
  upsertWorkspace as a9,
  setEvolutionWebhook as aa,
  listResponderAgentVariables as ab,
  upsertResponderAgentVariable as ac,
  deleteResponderAgentVariable as ad,
  listConversations as b,
  listWorkflowStates as c,
  deleteLead as d,
  listMessageThreads as e,
  listConversationMessages as f,
  getDashboardStats as g,
  listScheduledMessages as h,
  scheduleMessage as i,
  cancelScheduledMessage as j,
  listWorkspaces as k,
  listLeads as l,
  startConversation as m,
  listContacts as n,
  listAppointments as o,
  pauseLeadWorkflow as p,
  updateAppointmentStatus as q,
  listActiveWorkflows as r,
  sendHumanMessage as s,
  toggleHumanTakeover as t,
  useBranding as u,
  triggerLeadWorkflow as v,
  updateLeadStage as w,
  listMeetingOutcomes as x,
  getMeetingOutcomeStats as y,
  saveMeetingOutcome as z
};
