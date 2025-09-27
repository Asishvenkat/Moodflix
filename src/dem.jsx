
   import { useState ,useEffect} from 'react'

   const Card=({title})=>{
       const [count, setCount] = useState(0);
       const [hasLiked,setHasLiked]=useState(false);

       useEffect(()=>{
           console.log(`${title} has been liked:${hasLiked}`)
       },[hasLiked]);



       return(
           <div className="card"  onClick={()=>setCount(count+1)}>
               <h2>{title}<br/>{count||null}</h2>

               <button onClick={()=>setHasLiked(!hasLiked)}>
                   {hasLiked ? 'Liked' : 'Like'}
               </button>
           </div>
       )
   }

   const Demo=()=>{
       const [hasLiked,setHasLiked]=useState(false);
       return(
           <div className="card-container">
               <Card title="Star wars" rating ={6} isCool={true} />
               <Card title="Avatar"/>
               <Card title="The lion king"/>
           </div>
       )
   }
   export default Demo
