const AddGold = () => {
  const { users, updateUser } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [goldAmount, setGoldAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

}