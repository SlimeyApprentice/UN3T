#include <libwebsockets.h>
#include <string.h>
#include <signal.h>

#include "lib/server.h"

static struct lws_protocols protocols[] = {
	{ "http", lws_callback_http_dummy, 0, 0, 0, NULL, 0},
	LWS_PLUGIN_PROTOCOL_MINIMAL,
	LWS_PROTOCOL_LIST_TERM
};

static const lws_retry_bo_t retry = {
	.secs_since_valid_ping = 3,
	.secs_since_valid_hangup = 10,
};

static int interrupted;

static const struct lws_http_mount mount = {
	.mountpoint		= "/",			/* mountpoint URL */
	.origin			= ".",
	.def			= "index.html",
	.origin_protocol	= LWSMPRO_FILE,
	.mountpoint_len		= 1,			/* char count */
};

#if defined(LWS_WITH_PLUGINS)
/* if plugins enabled, only protocols explicitly named in pvo bind to vhost */
static struct lws_protocol_vhost_options pvo = { NULL, NULL, "UN3T", "" };
#endif

void sigint_handler(int sig)
{
	interrupted = 1;
}

int main(int argc, const char **argv) {
	struct lws_context_creation_info info;
	struct lws_context *context;
	const char *p;
	int n = 0;
    int logs = LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE;
			/* for LLL_ verbosity above NOTICE to be built into lws,
			 * lws must have been configured and built with
			 * -DCMAKE_BUILD_TYPE=DEBUG instead of =RELEASE */
			// | LLL_INFO | LLL_PARSER | LLL_HEADER
			// | LLL_EXT | LLL_CLIENT | LLL_LATENCY 
			// | LLL_DEBUG;

	signal(SIGINT, sigint_handler);

	lws_set_log_level(logs, NULL);
	lwsl_user("LWS minimal ws server | visit ws://localhost:8332\n");

	memset(&info, 0, sizeof info); /* otherwise uninitialized garbage */
	info.port = UN3T_SERVER_PORT;
	info.mounts = &mount;
	info.protocols = protocols;
	info.vhost_name = "localhost";
	#if defined(LWS_WITH_PLUGINS)
		info.pvo = &pvo;
	#endif
	info.options =
		LWS_SERVER_OPTION_HTTP_HEADERS_SECURITY_BEST_PRACTICES_ENFORCE;

	context = lws_create_context(&info);
	if (!context) {
		lwsl_err("lws init failed\n");
		return 1;
	}
	printf("%d %d, %d\n", sizeof(Connections), sizeof(ServerData), LWS_PRE);

	while (n >= 0 && !interrupted)
		n = lws_service(context, 0);

	lws_context_destroy(context);

	return 0;
}
