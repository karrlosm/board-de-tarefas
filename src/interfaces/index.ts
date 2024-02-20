export interface TaskItemProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export interface CommentsProps {
    id: string;
    comment: string;
    name: string;
    taskId: string;
    user: string;
}