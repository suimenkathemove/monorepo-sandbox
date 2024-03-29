use super::thread::Thread;
use crate::{
    apis::common::DateTimeUtc,
    use_cases::slack::{channel::ChannelUseCase, thread::ThreadUseCase},
};
use async_graphql::{Context, Object, SimpleObject};

define_id!(ChannelId, models::slack::channel::ChannelId);

define_name!(ChannelName, models::slack::channel::ChannelName);

pub struct Channel {
    pub id: ChannelId,
    pub name: ChannelName,
    pub description: String,
    pub private: bool,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

impl From<models::slack::channel::Channel> for Channel {
    fn from(channel: models::slack::channel::Channel) -> Self {
        Self {
            id: channel.id.into(),
            name: channel.name.into(),
            description: channel.description,
            private: channel.private,
            created_at: channel.created_at.into(),
            updated_at: channel.updated_at.into(),
        }
    }
}

#[Object]
impl Channel {
    async fn id(&self) -> ChannelId {
        self.id
    }

    async fn name(&self) -> ChannelName {
        self.name.to_owned()
    }

    async fn description(&self) -> String {
        self.description.to_owned()
    }

    async fn private(&self) -> bool {
        self.private
    }

    async fn created_at(&self) -> &DateTimeUtc {
        &self.created_at
    }

    async fn updated_at(&self) -> &DateTimeUtc {
        &self.updated_at
    }

    async fn threads(&self, ctx: &Context<'_>) -> Vec<Thread> {
        let thread_use_case = ctx.data_unchecked::<ThreadUseCase>();
        thread_use_case
            .list_by_channel_id(&self.id.into())
            .await
            .into_iter()
            .map(Into::into)
            .collect()
    }
}

#[derive(Default)]
pub struct ChannelQuery;

#[Object]
impl ChannelQuery {
    async fn list_channel(&self, ctx: &Context<'_>) -> Vec<Channel> {
        let channel_use_case = ctx.data_unchecked::<ChannelUseCase>();
        channel_use_case
            .list()
            .await
            .into_iter()
            .map(Into::into)
            .collect()
    }

    async fn get_channel(&self, ctx: &Context<'_>, id: ChannelId) -> Channel {
        let channel_use_case = ctx.data_unchecked::<ChannelUseCase>();
        channel_use_case.get(&id.into()).await.into()
    }
}

#[derive(SimpleObject)]
struct DeleteChannelOutput {
    id: ChannelId,
}

#[derive(Default)]
pub struct ChannelMutation;

#[Object]
impl ChannelMutation {
    async fn create_channel(
        &self,
        ctx: &Context<'_>,
        name: ChannelName,
        description: String,
        private: bool,
    ) -> Channel {
        let channel_use_case = ctx.data_unchecked::<ChannelUseCase>();
        channel_use_case
            .create(name.into(), description, private)
            .await
            .into()
    }

    async fn delete_channel(&self, ctx: &Context<'_>, id: ChannelId) -> DeleteChannelOutput {
        let channel_use_case = ctx.data_unchecked::<ChannelUseCase>();
        channel_use_case.delete(&id.into()).await;
        DeleteChannelOutput { id }
    }
}
