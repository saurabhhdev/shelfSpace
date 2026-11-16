import { useState } from "react"

const ResourceForm = () => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('')

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!title.trim()) {
    alert("Please enter a resource title");
    return;
  }

  if (!description.trim()) {
    alert("Please enter a description");
    return;
  }

  console.log(title);
  console.log(description);

  setTitle('');
  setDescription('');
};


  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)} />

            <textarea value ={description} onChange={(e) => setDescription(e.target.value)}>
            </textarea>

            <button type='submit'>Save Resource</button>
        </form>
    </div>
  )
}

export default ResourceForm