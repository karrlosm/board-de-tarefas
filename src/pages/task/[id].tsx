import Head from "next/head";
import styles from './styles.module.css';
import { GetServerSideProps } from "next";
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from "@/services/firebaseConnection";
import { CommentsProps, TaskItemProps } from "@/interfaces";
import { TextArea } from "@/components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from 'next-auth/react'
import { FaTrash } from "react-icons/fa";

interface TaskProps {
    item: TaskItemProps;
    allComments: CommentsProps[];
}

export default function Task({ item, allComments }: TaskProps) {

    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<CommentsProps[]>(allComments || [])

    async function handleComment(event: FormEvent) {
        event.preventDefault()
        if (comment === '') return;
        if (!session?.user?.email || !session.user.name) return;

        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                comment: comment,
                created: new Date(),
                user: session.user.email,
                name: session.user.name,
                taskId: item.id,
            })

            const data = {
                id: docRef.id,
                comment: comment,
                user: session.user.email,
                name: session.user.name,
                taskId: item.id,
            }

            setComments((prev) => [...prev, data])
            setComment('');
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDelete(id: string) {
        try {
            const docRef = doc(db, 'comments', id)
            await deleteDoc(docRef);
            
            const filterComments = comments.filter((item) => item.id !== id)
            setComments(filterComments)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>
                        {item?.tarefa}
                    </p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentários</h2>

                <form onSubmit={handleComment}>
                    <TextArea
                        value={comment}
                        onChange={
                            (e: ChangeEvent<HTMLTextAreaElement>) =>
                                setComment(e.target.value)
                        }
                        placeholder="Digite seu comentário..."/>
                    <button
                        disabled={!session?.user}
                        className={styles.button}>Fazer comentário</button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 &&
                    <span>Nenhum comentário foi encontrado</span>
                }
                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email &&
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className={styles.buttonTrash}>
                                    <FaTrash size={18} color="#ea3140" />
                                </button>
                            }
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const id = params?.id as string;
    
    const docRef = doc(db, 'tasks', id)
    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
    
    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;
    
    const task = {
        id: id,
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
    }

    const q = query(collection(db, 'comments'), where('taskId', '==', id))
    const snapshotComments = await getDocs(q);

    let allComments: CommentsProps[] = [];

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            name: doc.data().name,
            taskId: doc.data().taskId,
            user: doc.data().user,
        })
    })

    
    return {
        props: {
            item: task,
            allComments: allComments,
        }
    }
}