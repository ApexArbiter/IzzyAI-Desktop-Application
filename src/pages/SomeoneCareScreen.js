import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import CustomButton from '../components/Button';

function SomeoneCareScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};
  const [isIndividual, setIsIndividual] = useState(true);

  const onPressNext = () => {
    if (!isIndividual) {
      navigate("/ConsentGuardian", { state: { data, isSomeone: true } });
    } else {
      if (window.confirm("As the individual has the capacity to consent, they should register under 'Myself (Adult)' instead. Please go back and select 'Myself (Adult)' on the previous screen to continue the registration process")) {
        navigate(-1);
        navigate(-1);
      }
    }
  };

  const RadioButton = ({ selected, label, onPress }) => (
    <button 
      onClick={onPress}
      disabled={selected}
      className="flex items-center gap-4 mt-3 cursor-pointer"
    >
      <div className="h-[18px] w-[18px] border border-black rounded-full flex items-center justify-center">
        {selected && <div className="h-[10px] w-[10px] bg-black rounded-full" />}
      </div>
      <span className="text-base font-medium text-[#111920]">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <CustomHeader title="Consent Process" goBack={() => navigate(-1)} />
      
      <div className="flex-1 p-5">
        <h2 className="text-base font-semibold text-[#111920] mt-5">
          Does the individual have the capacity to consent to using this app
          <span className="text-red-500">*</span>
        </h2>

        <div className="mt-5">
          <RadioButton
            selected={isIndividual}
            label="Yes"
            onPress={() => setIsIndividual(true)}
          />
          <RadioButton
            selected={!isIndividual}
            label="No"
            onPress={() => setIsIndividual(false)}
          />
        </div>
      </div>

      <div className="fixed bottom-5 w-full px-5">
        <CustomButton
          className="rounded-md"
          onPress={onPressNext}
          title="Next"
        />
      </div>
    </div>
  );
}

export default SomeoneCareScreen;