use async_trait::async_trait;

#[async_trait]
pub trait IMessageRepository: Send + Sync {
    async fn list_by_thread_id(
        &self,
        thread_id: &models::thread::ThreadId,
    ) -> Vec<models::message::Message>;

    async fn create(
        &self,
        thread_id: &models::thread::ThreadId,
        text: String,
    ) -> models::message::Message;

    async fn delete(&self, id: &models::message::MessageId);
}
