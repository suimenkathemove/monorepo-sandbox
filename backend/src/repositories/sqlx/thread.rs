use crate::repositories::interfaces::thread::IThreadRepository;
use async_trait::async_trait;
use sqlx::{query_as, FromRow, PgPool};
use std::sync::Arc;
use uuid::Uuid;

#[derive(sqlx::Type)]
#[sqlx(transparent)]
pub struct ThreadId(pub Uuid);

impl Into<models::thread::ThreadId> for ThreadId {
    fn into(self) -> models::thread::ThreadId {
        models::thread::ThreadId(self.0)
    }
}

#[derive(FromRow)]
pub struct Thread {
    pub id: ThreadId,
}

impl Into<models::thread::Thread> for Thread {
    fn into(self) -> models::thread::Thread {
        models::thread::Thread { id: self.id.into() }
    }
}

pub struct ThreadRepository {
    pool: Arc<PgPool>,
}

impl ThreadRepository {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl IThreadRepository for ThreadRepository {
    async fn list(&self, channel_id: &models::channel::ChannelId) -> Vec<models::thread::Thread> {
        query_as::<_, Thread>("SELECT * FROM threads WHERE channel_id = $1")
            .bind(channel_id.0)
            .fetch_all(&*self.pool)
            .await
            .unwrap()
            .into_iter()
            .map(|t| t.into())
            .collect()
    }
}