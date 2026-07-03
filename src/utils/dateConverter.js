// This is to convert Date into Weeks 21/09/2024 => 36 weeks before deadline

const dateConverter = (date) => {
    const today = new Date();
    const deadline = new Date(date);
    const timeDiff = deadline - today;
    const weeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
    return weeks;
}

export default dateConverter;