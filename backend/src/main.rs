mod apis;
mod repositories;
mod use_cases;

use crate::{
    apis::{
        handlers::{graphql_handler::graphql_handler, graphql_playground::graphql_playground},
        MutationRoot, QueryRoot,
    },
    repositories::{
        interfaces::{
            notion::page::IPageRepository,
            slack::{
                channel::IChannelRepository, message::IMessageRepository, thread::IThreadRepository,
            },
        },
        postgres::{
            create_pool,
            notion::page::PageRepository,
            slack::{
                channel::ChannelRepository, message::MessageRepository, thread::ThreadRepository,
            },
        },
    },
    use_cases::{
        notion::page::PageUseCase,
        slack::{channel::ChannelUseCase, message::MessageUseCase, thread::ThreadUseCase},
    },
};
use async_graphql::{EmptySubscription, Schema};
use axum::{
    http::{header::CONTENT_TYPE, HeaderValue},
    routing::get,
    Extension, Router,
};
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "backend=trace".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let pool = create_pool().await;
    let pool = Arc::new(pool);

    let channel_repository: Arc<dyn IChannelRepository> =
        Arc::new(ChannelRepository::new(Arc::clone(&pool)));
    let thread_repository: Arc<dyn IThreadRepository> =
        Arc::new(ThreadRepository::new(Arc::clone(&pool)));
    let message_repository: Arc<dyn IMessageRepository> =
        Arc::new(MessageRepository::new(Arc::clone(&pool)));

    let channel_use_case = ChannelUseCase::new(Arc::clone(&channel_repository));
    let thread_use_case = ThreadUseCase::new(Arc::clone(&thread_repository));
    let message_use_case = MessageUseCase::new(
        Arc::clone(&thread_repository),
        Arc::clone(&message_repository),
    );

    let page_repository: Arc<dyn IPageRepository> =
        Arc::new(PageRepository::new(Arc::clone(&pool)));

    let page_use_case = PageUseCase::new(Arc::clone(&page_repository));

    let schema = Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(channel_use_case)
    .data(thread_use_case)
    .data(message_use_case)
    .data(page_use_case)
    .finish();

    let app = Router::new()
        .route("/", get(graphql_playground).post(graphql_handler))
        .layer(Extension(schema))
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
                .allow_methods(Any)
                .allow_headers(vec![CONTENT_TYPE]),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
