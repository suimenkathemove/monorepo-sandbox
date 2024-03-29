use crate::repositories::interfaces::slack::channel::IChannelRepository;
use std::sync::Arc;

pub struct ChannelUseCase {
    channel_repository: Arc<dyn IChannelRepository>,
}

impl ChannelUseCase {
    pub fn new(channel_repository: Arc<dyn IChannelRepository>) -> Self {
        Self { channel_repository }
    }

    pub async fn list(&self) -> Vec<models::slack::channel::Channel> {
        self.channel_repository.list().await
    }

    pub async fn get(
        &self,
        id: &models::slack::channel::ChannelId,
    ) -> models::slack::channel::Channel {
        self.channel_repository.get(id).await
    }

    pub async fn create(
        &self,
        name: models::slack::channel::ChannelName,
        description: String,
        private: bool,
    ) -> models::slack::channel::Channel {
        self.channel_repository
            .create(name, description, private)
            .await
    }

    pub async fn delete(&self, id: &models::slack::channel::ChannelId) {
        self.channel_repository.delete(id).await;
    }
}
